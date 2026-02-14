import Link from "next/link";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-lg shadow-blue-500/20 border border-cyan-500/20 overflow-hidden">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 animate-pulse" />

              {/* Lightning bolt */}
              <Zap className="relative h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" strokeWidth={2.5} fill="currentColor" />

              {/* Subtle spark */}
              <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping" />
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
