import type { Watch, WatchSummary } from "../types";

/**
 * Merges a base Watch with variant-specific overrides.
 * Variants should only specify fields that meaningfully differ from the base.
 * Everything else is inherited from the base entry unchanged.
 */
export function resolveWatch(base: Watch, overrides: Partial<Watch>): Watch {
  return { ...base, ...overrides };
}

/**
 * Extracts the WatchSummary-scoped fields from a full Watch object.
 * Used to derive watchSummaries at module load — do not re-derive in components.
 */
export function toWatchSummary(watch: Watch): WatchSummary {
  return {
    id: watch.id,
    brand: watch.brand,
    brandSlug: watch.brandSlug,
    model: watch.model,
    modelSlug: watch.modelSlug,
    reference: watch.reference,
    referenceSlug: watch.referenceSlug,
    variant: watch.variant,
    variantSlug: watch.variantSlug,
    nickname: watch.nickname,
    productionYears: watch.productionYears,
    discontinued: watch.discontinued,
    caseSize: watch.caseSize,
    dialColor: watch.dialColor,
    tags: watch.tags,
    imageUrl: watch.imageUrl,
    isVariant: watch.isVariant,
    parentReferenceSlug: watch.parentReferenceSlug,
  };
}

/**
 * Returns a human-readable production period string.
 * Uses the discontinued flag — does not parse productionYears.
 */
export function getProductionLabel(watch: Watch | WatchSummary): string {
  if (watch.discontinued) {
    return `${watch.productionYears} (Discontinued)`;
  }
  return watch.productionYears;
}

/**
 * Returns the canonical route path for a watch.
 * This is the single source of truth for route path construction.
 * Use everywhere a watch path is needed — never construct paths inline.
 */
export function getWatchPath(watch: Watch | WatchSummary): string {
  const base = `/${watch.brandSlug}/${watch.modelSlug}/${watch.referenceSlug}`;
  if (watch.isVariant && watch.variantSlug) {
    return `${base}/${watch.variantSlug}`;
  }
  return base;
}
