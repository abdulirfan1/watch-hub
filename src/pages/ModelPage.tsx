import { useParams } from "react-router-dom";
import { getByModelSlug } from "../data";
import { PageHeader } from "../components/PageHeader";
import { NotFound } from "../components/NotFound";
import { WatchCard } from "../components/WatchCard";
import { Breadcrumb } from "../components/Breadcrumb";

export default function ModelPage() {
  const { brandSlug, modelSlug } = useParams<{
    brandSlug: string;
    modelSlug: string;
  }>();

  if (!brandSlug || !modelSlug) return <NotFound />;

  const watches = getByModelSlug(brandSlug, modelSlug);

  if (watches.length === 0) return <NotFound />;

  const brandName = watches[0].brand;
  const modelName = watches[0].model;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Brands", to: "/brands" },
            { label: brandName, to: `/${brandSlug}` },
            { label: modelName },
          ]}
        />
      </div>

      <PageHeader
        title={modelName}
        subtitle={`${watches.length} reference${watches.length !== 1 ? "s" : ""}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {watches.map((watch) => (
          <WatchCard key={watch.id} watch={watch} />
        ))}
      </div>
    </div>
  );
}
