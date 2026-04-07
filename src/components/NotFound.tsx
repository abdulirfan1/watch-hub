import { Link } from "react-router-dom";
import { SearchBar } from "./SearchBar";

export function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-stone-100">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-stone-900">
        Page not found
      </h1>
      <p className="mt-2 text-stone-500">
        This watch reference doesn't exist in our database yet.
      </p>
      <div className="mt-8">
        <SearchBar />
      </div>
      <p className="mt-6 text-sm text-stone-400">
        Or{" "}
        <Link to="/brands" className="text-green-900 hover:underline">
          browse all brands
        </Link>
      </p>
    </div>
  );
}
