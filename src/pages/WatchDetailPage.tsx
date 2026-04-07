import { useParams, Link } from "react-router-dom";
import {
  getByReference,
  getVariants,
  watches,
} from "../data";
import { NotFound } from "../components/NotFound";
import { Breadcrumb } from "../components/Breadcrumb";
import { WatchSpecsGrid } from "../components/WatchSpecsGrid";
import { MSRPBlock } from "../components/MSRPBlock";
import { OutboundLinks } from "../components/OutboundLinks";
import { VariantList } from "../components/VariantList";
import { TagList } from "../components/TagList";
import { getProductionLabel, getWatchPath } from "../utils/watchUtils";
import type { WatchSpecs } from "../types";

export default function WatchDetailPage() {
  const { brandSlug, modelSlug, ref, variantSlug } = useParams<{
    brandSlug: string;
    modelSlug: string;
    ref: string;
    variantSlug?: string;
  }>();

  if (!brandSlug || !modelSlug || !ref) return <NotFound />;

  // Resolve the correct watch: variant or base reference
  const watch = variantSlug
    ? watches.find(
        (w) =>
          w.brandSlug === brandSlug &&
          w.modelSlug === modelSlug &&
          w.referenceSlug === ref &&
          w.isVariant &&
          w.variantSlug === variantSlug
      ) ?? null
    : getByReference(brandSlug, modelSlug, ref);

  if (!watch) return <NotFound />;

  const variants = variantSlug
    ? []
    : getVariants(brandSlug, modelSlug, ref);

  // For variant pages, look up the base reference for the "back" link
  const baseWatch =
    watch.isVariant && watch.parentReferenceSlug
      ? getByReference(brandSlug, modelSlug, watch.parentReferenceSlug)
      : null;

  const specs: WatchSpecs = {
    caseSize: watch.caseSize,
    thickness: watch.thickness,
    lugWidth: watch.lugWidth,
    caseMaterial: watch.caseMaterial,
    crystal: watch.crystal,
    waterResistance: watch.waterResistance,
    movement: watch.movement,
    powerReserve: watch.powerReserve,
    dialColor: watch.dialColor,
    bracelet: watch.bracelet,
    releaseMSRP: watch.releaseMSRP,
    finalMSRP: watch.finalMSRP,
  };

  const productionLabel = getProductionLabel(watch);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Brands", to: "/brands" },
            { label: watch.brand, to: `/${watch.brandSlug}` },
            {
              label: watch.model,
              to: `/${watch.brandSlug}/${watch.modelSlug}`,
            },
            ...(watch.isVariant && baseWatch
              ? [
                  {
                    label: watch.reference,
                    to: getWatchPath(baseWatch),
                  },
                  { label: watch.variant ?? watch.variantSlug ?? "Variant" },
                ]
              : [{ label: watch.reference }]),
          ]}
        />
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-stone-400 font-medium tracking-wide uppercase mb-1">
          {watch.brand} · {watch.model}
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold text-stone-900 font-mono tracking-tighter">
          {watch.reference}
        </h1>
        {watch.nickname && (
          <p className="mt-1 text-xl text-stone-500 italic">
            "{watch.nickname}"
          </p>
        )}
        {watch.variant && (
          <p className="mt-1 text-lg text-stone-500">{watch.variant}</p>
        )}
        <p className="mt-3 text-sm text-stone-400">{productionLabel}</p>

        {watch.tags.length > 0 && (
          <div className="mt-4">
            <TagList tags={watch.tags} />
          </div>
        )}
      </div>

      {/* Back to base reference link for variants */}
      {watch.isVariant && baseWatch && (
        <div className="mb-6">
          <Link
            to={getWatchPath(baseWatch)}
            className="text-sm text-green-900 hover:underline"
          >
            ← Back to {watch.reference} base reference
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Specs */}
          <section>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Specifications
            </h2>
            <WatchSpecsGrid specs={specs} />
          </section>

          {/* MSRP */}
          {(watch.releaseMSRP || watch.finalMSRP) && (
            <section>
              <MSRPBlock
                releaseMSRP={watch.releaseMSRP}
                finalMSRP={watch.finalMSRP}
              />
            </section>
          )}

          {/* Notes */}
          {watch.notes && (
            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Notes
              </h2>
              <p className="text-stone-700 leading-relaxed">{watch.notes}</p>
            </section>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <section>
              <VariantList variants={variants} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {watch.imageUrl && (
            <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
              <img
                src={watch.imageUrl}
                alt={`${watch.brand} ${watch.reference}`}
                className="w-full object-contain"
              />
            </div>
          )}

          <section>
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">
              Find This Watch
            </h2>
            <OutboundLinks links={watch.externalSearch} />
          </section>
        </div>
      </div>
    </div>
  );
}
