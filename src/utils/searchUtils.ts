/**
 * Normalizes a raw search query for use with Fuse.js.
 * Strips noise tokens, lowercases, and collapses whitespace.
 * The raw input shown in the UI is never modified — only call this at query time.
 */
export function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b(ref\.?|reference|#)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
