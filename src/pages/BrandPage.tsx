import { useParams, Link } from "react-router-dom";
import { getByBrandSlug } from "../data";
import { PageHeader } from "../components/PageHeader";
import { NotFound } from "../components/NotFound";
import { WatchCard } from "../components/WatchCard";

export default function BrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();

  if (!brandSlug) return <NotFound />;

  const watches = getByBrandSlug(brandSlug);

  if (watches.length === 0) return <NotFound />;

  const brandName = watches[0].brand;

  // Group by model
  const modelGroups = watches.reduce<Record<string, typeof watches>>(
    (acc, watch) => {
      const key = watch.modelSlug;
      if (!acc[key]) acc[key] = [];
      acc[key].push(watch);
      return acc;
    },
    {}
  );

  const modelEntries = Object.entries(modelGroups);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-2 text-sm text-stone-400">
        <Link to="/brands" className="hover:text-stone-700 transition-colors">
          Brands
        </Link>
        {" / "}
        <span className="text-stone-600">{brandName}</span>
      </div>

      <PageHeader title={brandName} />

      <div className="space-y-0">
        {modelEntries.map(([modelSlug, modelWatches], index) => {
          const modelName = modelWatches[0].model;
          return (
            <section key={modelSlug}>
              {index > 0 && <hr className="border-stone-100 mb-12" />}
              <div className="flex items-center gap-3 mb-6">
                <Link
                  to={`/${brandSlug}/${modelSlug}`}
                  className="text-xl font-semibold text-stone-800 hover:text-green-900 transition-colors"
                >
                  {modelName}
                </Link>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                  {modelWatches.length} ref{modelWatches.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {modelWatches.map((watch) => (
                  <WatchCard key={watch.id} watch={watch} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
