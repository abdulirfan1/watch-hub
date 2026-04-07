# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # preview production build
npx tsc --noEmit     # type-check without building (run after every change)

# AI-assisted watch data entry
npm run add-watch -- "Brand" "Model" "Reference"   # single watch, prints paste-ready TS
npm run bulk-add -- watches-list.csv               # batch import from CSV → writes directly to watches.ts
```

There are no tests. `tsc --noEmit` is the primary correctness check — run it after every non-trivial change and fix all errors before finishing.

## Architecture

This is a **no-backend, static-data React app**. All data is imported from TypeScript files at bundle time. There is no API, no server, no database.

### Data flow

```
src/data/watches.ts          — typed Watch[] array (the source of truth)
        ↓
src/data/index.ts            — imports watches.ts, builds Fuse.js index at module load,
                               exports watchSummaries + all query helpers
        ↓
pages/*.tsx                  — call data helpers, pass typed props to components
        ↓
components/*.tsx             — pure presentational, receive typed props
```

**Pages call data helpers. Components receive props. No data derivation inside components or JSX.**

### Key invariants

- **`getWatchPath(watch)`** (`src/utils/watchUtils.ts`) is the single source of truth for all route path construction. Never build watch paths inline.
- **`buildExternalSearchLinks(brand, reference)`** (`src/utils/marketplaceLinks.ts`) is the only place marketplace URLs are constructed. Never hardcode them elsewhere.
- **`resolveWatch(base, overrides)`** is the canonical way to create variant entries. Variants only specify fields that differ from the base.
- **`watchSummaries`** is derived once at module load in `src/data/index.ts`. Components use `WatchSummary` (a slim Pick of `Watch`) for cards and lists; the full `Watch` type is only used on detail pages.
- **`_meta`** fields (`verificationStatus`, `aiConfidence`, `sourceUrls`, `sourceNotes`) exist on every `Watch` but are intentionally not rendered in the UI. They are designed for a future verification workflow. `WatchSummary` excludes `_meta` by design.

### Route structure

```
/                              → HomePage
/search?q=                     → SearchPage
/brands                        → BrandsPage
/:brandSlug                    → BrandPage
/:brandSlug/:modelSlug         → ModelPage
/:brandSlug/:modelSlug/:ref    → WatchDetailPage (base reference)
/:brandSlug/:modelSlug/:ref/:variantSlug → WatchDetailPage (variant)
```

Both base references and variants render through the same `WatchDetailPage` component, which resolves the correct watch object from `useParams`.

### Adding watches

The preferred workflow is the AI-assisted scripts rather than hand-editing `watches.ts`:

- **Single watch:** `npm run add-watch -- "Brand" "Model" "REF"` — prints a paste-ready `const` block
- **Bulk:** add rows to `watches-list.csv` and run `npm run bulk-add -- watches-list.csv` — writes directly into `watches.ts` and appends to the `watches[]` array. Safe to re-run; already-existing entries (matched by `id`) are skipped.

Both scripts use `claude-haiku-4-5` and require `ANTHROPIC_API_KEY` in `.env`. All generated entries are marked `verificationStatus: "ai-generated"`.

When editing `watches.ts` manually: every entry needs `buildExternalSearchLinks(...)` for `externalSearch`, a valid `_meta` block, and must be added to the `watches[]` array at the bottom of the file.

### Slug conventions

- `brandSlug`, `modelSlug`, `referenceSlug`, `variantSlug`: lowercase, spaces and dots replaced with hyphens, no other special characters
- `id`: globally unique, format `{brandSlug}-{modelSlug}-{referenceSlug}` (append `-{variantSlug}` for variants)
- `releaseMSRP` / `finalMSRP` format: `"USD X,XXX (YYYY)"` — year in parens, used by `extractReleaseYear()` for sort ordering on model pages
- `productionYears`: use an en-dash (`–`), not a hyphen (`"2010–2020"` not `"2010-2020"`)
