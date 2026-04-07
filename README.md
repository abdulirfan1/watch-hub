# Watch Hub

A reference-first watch research platform. Search and browse detailed technical specifications, historical pricing, and outbound marketplace links for watches across major brands.

## Stack

- **Vite** — build tool and dev server
- **React 18** with TypeScript (strict mode)
- **React Router v6** — client-side routing
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Fuse.js** — fuzzy full-text search
- **lucide-react** — icons

## Running Locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
  components/     Shared UI components
  data/           Seed data and data-access functions
  hooks/          React hooks (useSearch)
  pages/          Route-level page components
  types/          TypeScript type definitions
  utils/          Pure utility functions
```

## How to Add a New Watch

All watch entries live in `src/data/watches.ts`. To add a new base reference:

1. Create a `const` of type `Watch` with all required fields.
2. Use `buildExternalSearchLinks(brand, reference)` from `src/utils/marketplaceLinks.ts` for the `externalSearch` field — never hardcode marketplace URLs.
3. Set `isVariant: false` and `parentReferenceSlug: null`.
4. Add the entry to the `watches` array at the bottom of the file.

### Required fields checklist

| Field | Example |
|---|---|
| `id` | `"rolex-submariner-116610ln"` (url-safe slug, globally unique) |
| `brand` | `"Rolex"` |
| `brandSlug` | `"rolex"` |
| `model` | `"Submariner"` |
| `modelSlug` | `"submariner"` |
| `reference` | `"116610LN"` |
| `referenceSlug` | `"116610ln"` |
| `productionYears` | `"2010–2020"` or `"2021–present"` |
| `discontinued` | `true` or `false` |
| `tags` | `["dive", "steel", "rolex"]` |
| `externalSearch` | `buildExternalSearchLinks("Rolex", "116610LN")` |
| `_meta` | see below |

Nullable fields (`variant`, `variantSlug`, `nickname`, `imageUrl`, `notes`, `parentReferenceSlug`, all spec fields) can be set to `null`.

### `_meta` field

Every watch entry requires a `_meta` object:

```typescript
_meta: {
  verificationStatus: "unverified", // or "partially-reviewed" or "human-verified"
  confidence: 0.8,                  // 0.0–1.0, or null if human-verified
  sourceUrls: [],                   // array of source URLs
  sourceNotes: null,                // string or null
}
```

These fields are internal and not rendered in the UI. They exist to support a future verification workflow.

## How to Add a Variant

Variants are watch entries where `isVariant: true`. Use `resolveWatch()` from `src/utils/watchUtils.ts` to inherit fields from a base entry and override only what differs:

```typescript
const myVariant: Watch = resolveWatch(myBaseWatch, {
  id: "brand-model-ref-variant-slug",
  variant: "Blue Dial",
  variantSlug: "blue-dial",
  dialColor: "Blue",
  isVariant: true,
  parentReferenceSlug: "base-ref-slug",
  externalSearch: buildExternalSearchLinks("Brand", "REF blue dial"),
  _meta: { verificationStatus: "unverified", confidence: 0.8, sourceUrls: [], sourceNotes: null },
});
```

Key conventions for variants:

- `isVariant` must be `true`
- `parentReferenceSlug` must match the `referenceSlug` of the canonical base reference (the one with `isVariant: false`)
- `variantSlug` should be a url-safe slug of the variant name (e.g. `"blue-dial"`, `"white-dial"`)
- Only override fields that meaningfully differ from the base

The variant's URL will be: `/:brandSlug/:modelSlug/:referenceSlug/:variantSlug`

## Ordering Conventions

- In `watches.ts`: group entries by brand, then by model within the brand
- Brand index (`/brands`): sorted alphabetically by brand name
- Brand page (`/:brandSlug`): sorted by model then reference
- Model page (`/:brandSlug/:modelSlug`): base references first (chronological by release year), then variants
- Variant list on detail page: sorted alphabetically by variant name

## Path Construction

Always use `getWatchPath(watch)` from `src/utils/watchUtils.ts` to build watch URLs. Never construct paths inline in components.

## `_meta` and Future Verification UI

The `_meta` field on every `Watch` object is designed to support a future editor/verification UI where:

- `verificationStatus: "unverified"` — data needs human review
- `verificationStatus: "partially-reviewed"` — some fields have been checked against sources
- `verificationStatus: "human-verified"` — all fields verified against cited source URLs

`confidence` (0.0–1.0) reflects an estimated data quality score; set to `null` for human-verified entries.

`sourceUrls` and `sourceNotes` are intended for tracking which manufacturer pages, press releases, or database entries were used to verify each record.

These fields are stored but not surfaced in the UI.
