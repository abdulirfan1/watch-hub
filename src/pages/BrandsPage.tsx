import { Link } from "react-router-dom";
import { getBrands } from "../data";
import { PageHeader } from "../components/PageHeader";

const brands = getBrands();

export default function BrandsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} brands in the database`}
      />

      <ul className="divide-y divide-stone-100">
        {brands.map((brand) => (
          <li key={brand.brandSlug}>
            <Link
              to={`/${brand.brandSlug}`}
              className="flex items-center justify-between py-4 group"
            >
              <span className="text-lg font-medium text-stone-900 group-hover:text-green-900 transition-colors">
                {brand.brand}
              </span>
              <span className="text-sm text-stone-400">
                {brand.count} reference{brand.count !== 1 ? "s" : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
