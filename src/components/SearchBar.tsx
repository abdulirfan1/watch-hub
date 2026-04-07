import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { searchWatches } from "../data";
import { WatchCard } from "./WatchCard";

interface SearchBarProps {
  initialValue?: string;
  /** If true, show inline results below the input (home page mode) */
  inline?: boolean;
}

export function SearchBar({ initialValue = "", inline = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<ReturnType<typeof searchWatches>>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const found = searchWatches(query);
      setResults(found);
      setShowResults(inline && found.length > 0);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, inline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, model, or reference…"
            className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-colors text-sm sm:text-base"
          />
        </div>
      </form>

      {inline && showResults && results.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.slice(0, 6).map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      )}
    </div>
  );
}
