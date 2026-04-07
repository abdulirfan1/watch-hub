import { useState, useEffect, useRef } from "react";
import type { WatchSummary } from "../types";
import { searchWatches } from "../data";

/**
 * Debounced search hook. Returns results as WatchSummary[].
 * Normalizes the query internally via searchWatches → normalizeQuery.
 */
export function useSearch(query: string, debounceMs = 250): WatchSummary[] {
  const [results, setResults] = useState<WatchSummary[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      setResults(searchWatches(query));
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return results;
}
