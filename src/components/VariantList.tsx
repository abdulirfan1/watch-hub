import { Link } from "react-router-dom";
import type { WatchSummary } from "../types";
import { getWatchPath } from "../utils/watchUtils";

interface VariantListProps {
  variants: WatchSummary[];
}

export function VariantList({ variants }: VariantListProps) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
        Variants
      </h3>
      <ul className="space-y-1">
        {variants.map((v) => (
          <li key={v.id}>
            <Link
              to={getWatchPath(v)}
              className="flex items-center justify-between px-4 py-3 border border-stone-200 rounded-lg text-sm hover:border-stone-400 transition-colors group"
            >
              <div>
                <span className="font-medium text-stone-800 group-hover:text-green-900 transition-colors">
                  {v.variant}
                </span>
                {v.dialColor && (
                  <span className="ml-2 text-stone-400">{v.dialColor} dial</span>
                )}
              </div>
              <span className="text-xs text-stone-400">{v.reference}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
