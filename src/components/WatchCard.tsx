import { Link } from "react-router-dom";
import type { WatchSummary } from "../types";
import { getWatchPath, getProductionLabel } from "../utils/watchUtils";

interface WatchCardProps {
  watch: WatchSummary;
}

export function WatchCard({ watch }: WatchCardProps) {
  const path = getWatchPath(watch);
  const productionLabel = getProductionLabel(watch);

  return (
    <Link
      to={path}
      className="group flex flex-col border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 hover:shadow-md transition-all bg-amber-50"
    >
      {/* Accent bar */}
      <div className="h-0.5 bg-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex flex-col flex-1">
        <div className="space-y-0.5">
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase">
            {watch.brand}
          </p>
          <h3 className="font-semibold text-stone-900 group-hover:text-green-900 transition-colors">
            {watch.model}
          </h3>
          <p className="text-base font-mono font-semibold text-stone-700">
            {watch.reference}
          </p>
          {watch.nickname && (
            <p className="text-sm text-stone-400 italic">"{watch.nickname}"</p>
          )}
          {watch.variant && (
            <p className="text-sm text-stone-500">{watch.variant}</p>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            {watch.caseSize && <span>{watch.caseSize}</span>}
            {watch.caseSize && watch.dialColor && (
              <span className="text-stone-300">·</span>
            )}
            {watch.dialColor && <span>{watch.dialColor}</span>}
          </div>
          <span>{productionLabel}</span>
        </div>
      </div>
    </Link>
  );
}
