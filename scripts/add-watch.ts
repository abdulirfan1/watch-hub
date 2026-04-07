#!/usr/bin/env npx tsx

/**
 * add-watch.ts — watch entry generator
 *
 * Looks up specifications for a watch reference and prints
 * a complete, paste-ready Watch entry for src/data/watches.ts.
 *
 * Usage:
 *   npm run add-watch -- "Rolex" "Submariner" "126610LN"
 *   npm run add-watch -- "Omega" "Speedmaster Professional" "310.30.42.30.01.001"
 *
 * Requires ANTHROPIC_API_KEY to be set in your environment.
 * All generated entries are marked verificationStatus: "unverified" — review before publishing.
 */

import Anthropic from "@anthropic-ai/sdk";

// ── CLI args ─────────────────────────────────────────────────────────────────

const [, , brand, model, reference] = process.argv;

if (!brand || !model || !reference) {
  console.error("\nUsage: npm run add-watch -- <brand> <model> <reference>");
  console.error(
    '  Example: npm run add-watch -- "Rolex" "Submariner" "126610LN"'
  );
  console.error(
    '  Example: npm run add-watch -- "Grand Seiko" "Heritage Collection" "SBGW231"\n'
  );
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a string to a URL-safe slug.
 * Dots and spaces become hyphens; everything else non-alphanumeric is stripped.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Wraps a string value in quotes, or returns the literal "null". */
function ts(value: string | null): string {
  if (value === null) return "null";
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// ── Lookup response shape ─────────────────────────────────────────────────────

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

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const client = new Anthropic();

  console.log(`\nLooking up: ${brand} ${model} ${reference} …\n`);

  const prompt = `You are a watch database curator with expert knowledge of luxury and independent watchmaking.

Look up accurate, real-world specifications for this watch reference:
  Brand:     ${brand}
  Model:     ${model}
  Reference: ${reference}

Return ONLY a valid JSON object — no markdown, no explanation, no code fences.
Use null for any field you are not confident about. Do not guess.

{
  "nickname": string or null — common collector nickname (e.g. "Batman", "Kermit", "Snowflake"),
  "productionYears": string — e.g. "2013–2019" or "2021–present" (use an en-dash –, not a hyphen),
  "discontinued": boolean,
  "caseSize": string or null — e.g. "40mm",
  "thickness": string or null — e.g. "12.5mm",
  "lugWidth": string or null — e.g. "20mm",
  "caseMaterial": string or null — e.g. "Oystersteel (904L)", "Titanium", "18ct white gold",
  "crystal": string or null — e.g. "Sapphire with Cyclops magnifier",
  "waterResistance": string or null — e.g. "300m / 1000ft",
  "movement": string or null — include caliber designation e.g. "Rolex Calibre 3235",
  "powerReserve": string or null — e.g. "70 hours",
  "dialColor": string or null — e.g. "Black", "Blue", "Champagne",
  "bracelet": string or null — e.g. "Oyster (Glidelock clasp)", "Jubilee", "Rubber strap",
  "releaseMSRP": string or null — format exactly as "USD X,XXX (YYYY)",
  "finalMSRP": string or null — format exactly as "USD X,XXX (YYYY)", only set if discontinued,
  "tags": string[] — lowercase tags. Include: brand slug, model category (e.g. "dive", "chronograph", "gmt", "dress"), notable features (e.g. "ceramic-bezel", "no-date", "spring-drive"), material if notable,
  "notes": string or null — 2–3 sentences of factual context about this reference (history, key features, successors)
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";

  // Strip markdown code fences if they were included in the response
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  let data: WatchLookupResult;
  try {
    data = JSON.parse(jsonText) as WatchLookupResult;
  } catch {
    console.error("Received non-JSON output. Raw response:\n");
    console.error(rawText);
    process.exit(1);
  }

  // ── Build slugs ─────────────────────────────────────────────────────────────

  const brandSlug = slugify(brand);
  const modelSlug = slugify(model);
  const referenceSlug = slugify(reference);
  const id = `${brandSlug}-${modelSlug}-${referenceSlug}`;

  // ── Format as TypeScript ────────────────────────────────────────────────────

  const tagsStr = JSON.stringify(data.tags ?? []);
  const notesStr = ts(data.notes ?? null);

  const output = `// ${brand} ${model} ${reference}
const ${safeVarName(brand, model, reference)}: Watch = {
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
  notes: ${notesStr},
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

  console.log("─".repeat(64));
  console.log("Paste into src/data/watches.ts:\n");
  console.log(output);
  console.log("\n─".repeat(64));
  console.log("Then add the variable name to the watches[] array.");
  console.log("⚠  Unverified — review specs before publishing.\n");
}

/**
 * Produces a valid JS variable name from brand, model, and reference.
 * e.g. "Rolex", "Submariner", "126610LN" → "rolexSubmariner126610ln"
 */
function safeVarName(b: string, m: string, ref: string): string {
  const toCamel = (s: string) =>
    s
      .trim()
      // Strip all chars that aren't alphanumeric, spaces, or hyphens before splitting
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

  return toCamel(b) + capitalize(toCamel(m)) + capitalize(toCamel(ref));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\nError: ${message}\n`);
  process.exit(1);
});
