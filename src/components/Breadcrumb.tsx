import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-stone-300" />}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="hover:text-stone-700 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-stone-600">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
