import type { ExternalSearchLinks } from "../types";
import { ExternalLink } from "lucide-react";

interface OutboundLinksProps {
  links: ExternalSearchLinks;
}

const PLATFORMS: { key: keyof ExternalSearchLinks; label: string }[] = [
  { key: "chrono24", label: "Search on Chrono24" },
  { key: "ebay", label: "Search on eBay" },
  { key: "bezel", label: "Search on Bezel" },
  { key: "watchrecon", label: "Search on WatchRecon" },
  { key: "google", label: "Google Shopping" },
];

export function OutboundLinks({ links }: OutboundLinksProps) {
  return (
    <div className="space-y-2">
      {PLATFORMS.map(({ key, label }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:border-green-800 hover:text-green-900 transition-colors group"
        >
          <span>{label}</span>
          <ExternalLink
            size={14}
            className="text-stone-300 group-hover:text-green-800 transition-colors"
          />
        </a>
      ))}
    </div>
  );
}
