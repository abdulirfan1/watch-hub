import type { ExternalSearchLinks } from "../types";

/**
 * Builds all five marketplace search URLs for a given brand + reference.
 * This is the single source of truth for outbound URL construction.
 * No marketplace URLs should be hardcoded anywhere else in the codebase.
 */
export function buildExternalSearchLinks(
  brand: string,
  reference: string
): ExternalSearchLinks {
  const sanitize = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, "+");

  // Chrono24 uses the brand as a path segment (hyphens, not plus signs)
  const brandPathSlug = brand.toLowerCase().trim().replace(/\s+/g, "-");
  const term = `${sanitize(brand)}+${sanitize(reference)}`;

  return {
    ebay: `https://www.ebay.com/sch/i.html?_nkw=${term}`,
    chrono24: `https://www.chrono24.com/${brandPathSlug}/index.htm?dosearch=true&query=${term}`,
    bezel: `https://shop.getbezel.com/explore?searchQuery=${term}`,
    watchrecon: `https://www.watchrecon.com/?query=${term}`,
    google: `https://www.google.com/search?q=${term}+for+sale&tbm=shop`,
  };
}
