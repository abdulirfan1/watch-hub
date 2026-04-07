import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { WatchCard } from "../components/WatchCard";
import { useSearch } from "../hooks/useSearch";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const results = useSearch(query);

  // Sync query param when user types
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [query, setSearchParams]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, model, or reference…"
            autoFocus
            className="w-full px-4 py-3.5 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-colors"
          />
        </div>
        {query.trim() && (
          <p className="mt-3 text-sm text-stone-400">
            {results.length === 0
              ? "No results found"
              : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {query.trim() && results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-400 text-lg">No watches found for "{query}"</p>
          <p className="mt-2 text-sm text-stone-400">
            Try searching by brand name, model, or reference number.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-16">
          <p className="text-stone-400">
            Start typing to search watches by brand, model, or reference.
          </p>
        </div>
      )}
    </div>
  );
}
