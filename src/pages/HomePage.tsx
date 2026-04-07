import { Link } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { WatchCard } from "../components/WatchCard";
import { watchSummaries, getBrands } from "../data";

// Hardcoded featured watch IDs
const FEATURED_IDS = [
  "rolex-submariner-116610ln",
  "rolex-gmt-master-ii-116710blnr",
  "omega-speedmaster-professional-31130423001005",
  "tudor-black-bay-58-79030n",
  "grand-seiko-sbga211",
  "grand-seiko-slgh005",
];

const featuredWatches = FEATURED_IDS
  .map((id) => watchSummaries.find((w) => w.id === id))
  .filter((w): w is NonNullable<typeof w> => w !== undefined);

const brandCount = getBrands().length;
const referenceCount = watchSummaries.filter((w) => !w.isVariant).length;

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-green-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-4">
            Reference-first watch research
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
            Watch Hub
          </h1>
          <p className="text-stone-400 text-lg mb-10">
            Detailed specs, historical pricing, and marketplace links for{" "}
            <span className="text-white font-medium">{referenceCount} references</span>{" "}
            across{" "}
            <span className="text-white font-medium">{brandCount} brands</span>.
          </p>

          <SearchBar />
        </div>
      </div>

      {/* Featured section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">
            Featured References
          </h2>
          <Link
            to="/brands"
            className="text-sm text-green-800 hover:text-green-900 hover:underline transition-colors"
          >
            Browse all brands →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredWatches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      </div>
    </div>
  );
}
