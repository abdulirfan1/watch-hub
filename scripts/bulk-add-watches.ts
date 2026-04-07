#!/usr/bin/env npx tsx

/**
 * bulk-add-watches.ts — Batch watch entry generator
 *
 * Reads a CSV list of watches, looks up specs for each, and writes
 * complete Watch entries directly into src/data/watches.ts.
 *
 * Usage:
 *   npm run bulk-add -- watches-list.csv
 *
 * CSV format (with or without header row):
 *   brand,model,reference
 *   Rolex,Submariner,126610LN
 *   Omega,Speedmaster Professional,310.30.42.30.01.001
 *
 * Requires ANTHROPIC_API_KEY in your environment.
 *
 * Safe to re-run: watches already in watches.ts are skipped automatically.
 * If interrupted, re-run the same command — it picks up where it left off.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WATCHES_TS = resolve(__dirname, "../src/data/watches.ts");

// ── CLI args ──────────────────────────────────────────────────────────────────

const [, , inputFile] = process.argv;

if (!inputFile) {
  console.error("\nUsage: npm run bulk-add -- <input.csv>");
  console.error("  Example: npm run bulk-add -- watches-list.csv\n");
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface WatchInput {
  brand: string;
  model: string;
  reference: string;
}

interface WatchLookupResult {
  nickname: string | null;
  productionYears: string;
  discontinued: boolean;
  caseSize: string | null;
  thickness: string | null;
  lugWidth: string | null;
  caseMaterial: string | null;
  crystal: string | null;
  waterResistance: string | null;
  movement: string | null;
  powerReserve: string | null;
  dialColor: string | null;
  bracelet: string | null;
  releaseMSRP: string | null;
  finalMSRP: string | null;
  tags: string[];
  notes: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ts(value: string | null): string {
  if (value === null) return "null";
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function safeVarName(brand: string, model: string, ref: string): string {
  const toCamel = (s: string): string =>
    s
      .trim()
      // Strip all chars that aren't alphanumeric, spaces, or hyphens before splitting
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

  const cap = (s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1);

  return toCamel(brand) + cap(toCamel(model)) + cap(toCamel(ref));
}

/** Parse CSV — supports optional header row (detected by checking if first cell is "brand") */
function parseCSV(raw: string): WatchInput[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const rows = lines.map((l) => l.split(",").map((c) => c.trim()));

  // Skip header if present
  const start =
    rows[0]?.[0]?.toLowerCase() === "brand" ||
    rows[0]?.[0]?.toLowerCase() === "make"
      ? 1
      : 0;

  return rows.slice(start).flatMap((cols) => {
    if (cols.length < 3) return [];
    const [brand, model, reference] = cols;
    if (!brand || !model || !reference) return [];
    return [{ brand, model, reference }];
  });
}

/** Check if a watch id already exists in watches.ts */
function alreadyExists(id: string, fileContent: string): boolean {
  return fileContent.includes(`id: "${id}"`);
}

/** Build the TypeScript const block for a watch entry */
function buildEntry(
  input: WatchInput,
  data: WatchLookupResult,
  varName: string,
  id: string,
  brandSlug: string,
  modelSlug: string,
  referenceSlug: string
): string {
  const { brand, model, reference } = input;
  const tagsStr = JSON.stringify(data.tags ?? []);

  return `
// ${brand} ${model} ${reference}
const ${varName}: Watch = {
  id: "${id}",
  brand: "${brand}",
  brandSlug: "${brandSlug}",
  model: "${model}",
  modelSlug: "${modelSlug}",
  reference: "${reference}",
  referenceSlug: "${referenceSlug}",
  variant: null,
  variantSlug: null,
  nickname: ${ts(data.nickname)},
  productionYears: "${data.productionYears}",
  discontinued: ${data.discontinued ?? false},
  tags: ${tagsStr},
  imageUrl: null,
  notes: ${ts(data.notes)},
  isVariant: false,
  parentReferenceSlug: null,
  caseSize: ${ts(data.caseSize)},
  thickness: ${ts(data.thickness)},
  lugWidth: ${ts(data.lugWidth)},
  caseMaterial: ${ts(data.caseMaterial)},
  crystal: ${ts(data.crystal)},
  waterResistance: ${ts(data.waterResistance)},
  movement: ${ts(data.movement)},
  powerReserve: ${ts(data.powerReserve)},
  dialColor: ${ts(data.dialColor)},
  bracelet: ${ts(data.bracelet)},
  releaseMSRP: ${ts(data.releaseMSRP)},
  finalMSRP: ${ts(data.finalMSRP)},
  externalSearch: buildExternalSearchLinks("${brand}", "${reference}"),
  _meta: {
    verificationStatus: "unverified",
    confidence: 0.8,
    sourceUrls: [],
    sourceNotes: null,
  },
};`;
}

/** Insert a new const block and variable name into watches.ts */
function writeToWatchesTs(entry: string, varName: string): void {
  let content = readFileSync(WATCHES_TS, "utf-8");

  // Insert the const block just before "export const watches"
  const exportMarker = "\nexport const watches:";
  const insertPos = content.indexOf(exportMarker);
  if (insertPos === -1) {
    throw new Error('Could not find "export const watches:" in watches.ts');
  }
  content =
    content.slice(0, insertPos) + entry + "\n" + content.slice(insertPos);

  // Add the variable name to the watches[] array (before the closing ];)
  // Handles files with or without a trailing newline after ];
  content = content.replace(/(\n\];)\s*$/, `\n  ${varName},$1\n`);

  writeFileSync(WATCHES_TS, content, "utf-8");
}

/** Look up specs for a watch */
async function lookupSpecs(
  client: Anthropic,
  input: WatchInput
): Promise<WatchLookupResult> {
  const { brand, model, reference } = input;

  const prompt = `You are a watch database curator with expert knowledge of luxury and independent watchmaking.

Look up accurate, real-world specifications for this watch reference:
  Brand:     ${brand}
  Model:     ${model}
  Reference: ${reference}

Return ONLY a valid JSON object — no markdown, no explanation, no code fences.
Use null for any field you are not confident about. Do not guess.

{
  "nickname": string or null,
  "productionYears": string (e.g. "2013–2019" or "2021–present", use en-dash –),
  "discontinued": boolean,
  "caseSize": string or null (e.g. "40mm"),
  "thickness": string or null (e.g. "12.5mm"),
  "lugWidth": string or null (e.g. "20mm"),
  "caseMaterial": string or null,
  "crystal": string or null,
  "waterResistance": string or null (e.g. "300m / 1000ft"),
  "movement": string or null (include caliber number),
  "powerReserve": string or null (e.g. "70 hours"),
  "dialColor": string or null,
  "bracelet": string or null,
  "releaseMSRP": string or null (format: "USD X,XXX (YYYY)"),
  "finalMSRP": string or null (format: "USD X,XXX (YYYY)", only if discontinued),
  "tags": string[] (lowercase: brand slug, category like "dive"/"chronograph"/"gmt", notable features),
  "notes": string or null (2–3 sentences of factual context)
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";

  const jsonText = rawText
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  return JSON.parse(jsonText) as WatchLookupResult;
}

/** Sleep for a given number of milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const client = new Anthropic();

  // Parse input file
  const csvPath = resolve(process.cwd(), inputFile);
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, "utf-8");
  } catch {
    console.error(`\nCould not read file: ${csvPath}\n`);
    process.exit(1);
  }

  const inputs = parseCSV(csvContent);
  if (inputs.length === 0) {
    console.error("\nNo valid entries found in CSV. Expected: brand,model,reference\n");
    process.exit(1);
  }

  console.log(`\nFound ${inputs.length} watches to process.\n`);

  const results = { added: 0, skipped: 0, failed: 0 };
  const failures: string[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const { brand, model, reference } = input;
    const label = `${brand} ${model} ${reference}`;
    const prefix = `[${i + 1}/${inputs.length}]`;

    const brandSlug = slugify(brand);
    const modelSlug = slugify(model);
    const referenceSlug = slugify(reference);
    const id = `${brandSlug}-${modelSlug}-${referenceSlug}`;
    const varName = safeVarName(brand, model, reference);

    // Re-read the file each iteration so we get the latest state
    const currentContent = readFileSync(WATCHES_TS, "utf-8");

    if (alreadyExists(id, currentContent)) {
      console.log(`${prefix} SKIP  ${label}`);
      results.skipped++;
      continue;
    }

    process.stdout.write(`${prefix} …     ${label}`);

    try {
      const data = await lookupSpecs(client, input);
      const entry = buildEntry(
        input,
        data,
        varName,
        id,
        brandSlug,
        modelSlug,
        referenceSlug
      );
      writeToWatchesTs(entry, varName);

      process.stdout.write(`\r${prefix} ✓     ${label}\n`);
      results.added++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stdout.write(`\r${prefix} ✗     ${label}\n`);
      process.stdout.write(`         Error: ${message}\n`);
      results.failed++;
      failures.push(`${label} — ${message}`);
    }

    // Brief pause between requests to stay within rate limits
    if (i < inputs.length - 1) {
      await sleep(350);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log("\n" + "─".repeat(48));
  console.log(`  Added:   ${results.added}`);
  console.log(`  Skipped: ${results.skipped} (already existed)`);
  console.log(`  Failed:  ${results.failed}`);
  console.log("─".repeat(48));

  if (failures.length > 0) {
    console.log("\nFailed entries:");
    failures.forEach((f) => console.log(`  • ${f}`));
    console.log("\nRe-run the same command to retry failed entries.");
  }

  if (results.added > 0) {
    console.log(
      `\n⚠  ${results.added} unverified entries written to src/data/watches.ts`
    );
    console.log("   Review specs before publishing.\n");
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\nFatal error: ${message}\n`);
  process.exit(1);
});
