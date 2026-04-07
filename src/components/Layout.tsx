import { Link, Outlet } from "react-router-dom";
import { Watch } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 text-stone-900">
      <header className="bg-green-950 border-b border-green-900">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-white hover:text-green-400 transition-colors"
          >
            <Watch size={20} strokeWidth={1.5} />
            <span className="tracking-tight">Watch Hub</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/brands"
              className="text-green-300 hover:text-white transition-colors"
            >
              Brands
            </Link>
            <Link
              to="/search"
              className="text-green-300 hover:text-white transition-colors"
            >
              Search
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <p>Watch Hub — Reference-first watch research.</p>
          <p>
            Outbound links go to third-party marketplaces. Watch Hub does not
            sell watches.
          </p>
        </div>
      </footer>
    </div>
  );
}
