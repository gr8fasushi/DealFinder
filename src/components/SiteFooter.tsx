import Link from "next/link";
import { Tag } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Tag className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">DealFinder</span>
          </div>
          <nav className="flex items-center gap-8 text-sm">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link href="/saved" className="hover:text-white transition-colors duration-200">
              Saved Deals
            </Link>
          </nav>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} DealFinder
          </p>
        </div>
      </div>
    </footer>
  );
}
