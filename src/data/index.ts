import Fuse from "fuse.js";
import type { Watch, WatchSummary, BrandIndexEntry } from "../types";
import { watches } from "./watches";
import { normalizeQuery } from "../utils/searchUtils";
import { toWatchSummary } from "../utils/watchUtils";

export { watches };

/** Derived once at module load — do not re-derive in components */
export const watchSummaries: WatchSummary[] = watches.map(toWatchSummary);

const fuseIndex = new Fuse(watchSummaries, {
  keys: ["brand", "model", "reference", "nickname", "tags"],
  threshold: 0.35,
  includeScore: true,
});

/**
 * Returns a deduplicated brand list with reference counts, sorted alphabetically.
 */
export function getBrands(): BrandIndexEntry[] {
  const map = new Map<string, BrandIndexEntry>();

  for (const w of watches) {
    const existing = map.get(w.brandSlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(w.brandSlug, {
        brand: w.brand,
        brandSlug: w.brandSlug,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.brand.localeCompare(b.brand)
  );
}

/**
 * All WatchSummary entries for a brand, sorted by model then reference.
 */
export function getByBrandSlug(slug: string): WatchSummary[] {
  return watchSummaries
    .filter((w) => w.brandSlug === slug)
    .sort((a, b) => {
      const modelCmp = a.model.localeCompare(b.model);
      if (modelCmp !== 0) return modelCmp;
      return a.reference.localeCompare(b.reference);
    });
}

/**
 * Extracts the first 4-digit year from a releaseMSRP string, or null.
 */
function extractReleaseYear(releaseMSRP: string | null): number | null {
  if (!releaseMSRP) return null;
  const match = releaseMSRP.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * All WatchSummary entries for a model family.
 * Base references first (isVariant: false), then variants.
 * Within each group: sort by extracted release year ascending, then by reference string.
 */
export function getByModelSlug(
  brandSlug: string,
  modelSlug: string
): WatchSummary[] {
  const entries = watchSummaries.filter(
    (w) => w.brandSlug === brandSlug && w.modelSlug === modelSlug
  );

  const bases = entries.filter((w) => !w.isVariant);
  const variants = entries.filter((w) => w.isVariant);

  const sortGroup = (group: WatchSummary[]): WatchSummary[] => {
    // We need the full watch to access releaseMSRP for year extraction
    return group.sort((a, b) => {
      // Non-null assertion safe: we know every summary has a corresponding full watch
      // because watchSummaries is derived from watches via toWatchSummary
      const watchA = watches.find((w) => w.id === a.id)!;
      const watchB = watches.find((w) => w.id === b.id)!;
      const yearA = extractReleaseYear(watchA.releaseMSRP);
      const yearB = extractReleaseYear(watchB.releaseMSRP);

      if (yearA !== null && yearB !== null) return yearA - yearB;
      if (yearA !== null) return -1;
      if (yearB !== null) return 1;
      return a.reference.localeCompare(b.reference);
    });
  };

  return [...sortGroup(bases), ...sortGroup(variants)];
}

/**
 * Returns the full Watch for the given slugs, or null.
 */
export function getByReference(
  brandSlug: string,
  modelSlug: string,
  refSlug: string
): Watch | null {
  return (
    watches.find(
      (w) =>
        w.brandSlug === brandSlug &&
        w.modelSlug === modelSlug &&
        w.referenceSlug === refSlug &&
        !w.isVariant
    ) ?? null
  );
}

/**
 * Returns variants for a given base reference slug.
 */
export function getVariants(
  brandSlug: string,
  modelSlug: string,
  refSlug: string
): WatchSummary[] {
  return watchSummaries
    .filter(
      (w) =>
        w.brandSlug === brandSlug &&
        w.modelSlug === modelSlug &&
        w.isVariant &&
        w.parentReferenceSlug === refSlug
    )
    .sort((a, b) => (a.variant ?? "").localeCompare(b.variant ?? ""));
}

/**
 * Searches watches using Fuse.js. Normalizes query before searching.
 */
export function searchWatches(query: string): WatchSummary[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  return fuseIndex.search(normalized).map((r) => r.item);
}
