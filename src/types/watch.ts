/** Verification metadata — internal only, not rendered in UI */
export type VerificationStatus =
  | "unverified"
  | "partially-reviewed"
  | "human-verified";

export interface WatchMeta {
  verificationStatus: VerificationStatus;
  confidence: number | null; // 0.0–1.0, or null if human-verified
  sourceUrls: string[];
  sourceNotes: string | null;
}

/** Pre-built outbound search URLs, one per supported marketplace */
export interface ExternalSearchLinks {
  ebay: string;
  chrono24: string;
  bezel: string;
  watchrecon: string;
  google: string;
}

/** All physical and commercial spec fields for a watch reference */
export interface WatchSpecs {
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
  releaseMSRP: string | null; // e.g. "USD 7,500 (2003)"
  finalMSRP: string | null; // e.g. "USD 8,550 (2010)"
}

/** A single watch entry — base reference or variant */
export interface Watch extends WatchSpecs {
  // Identity
  id: string; // url-safe slug, globally unique
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  reference: string;
  referenceSlug: string;
  variant: string | null;
  variantSlug: string | null;
  nickname: string | null;

  // Production
  productionYears: string; // e.g. "2003–2010" or "2021–present"
  discontinued: boolean;

  // Classification
  tags: string[];
  imageUrl: string | null;
  notes: string | null;

  // Variant linkage
  isVariant: boolean;
  parentReferenceSlug: string | null;

  // Outbound links (always generated via buildExternalSearchLinks utility)
  externalSearch: ExternalSearchLinks;

  // Internal metadata (not rendered in MVP UI)
  _meta: WatchMeta;
}

/** Slim card shape used in search results and index grids */
export type WatchSummary = Pick<
  Watch,
  | "id"
  | "brand"
  | "brandSlug"
  | "model"
  | "modelSlug"
  | "reference"
  | "referenceSlug"
  | "variant"
  | "variantSlug"
  | "nickname"
  | "productionYears"
  | "discontinued"
  | "caseSize"
  | "dialColor"
  | "tags"
  | "imageUrl"
  | "isVariant"
  | "parentReferenceSlug"
>;

/** Brand index entry returned by getBrands() */
export interface BrandIndexEntry {
  brand: string;
  brandSlug: string;
  count: number; // total references (including variants) for this brand
}
