"use client";

import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Zap, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { isSignedIn, user, isLoaded } = useUser();
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-lg shadow-blue-500/30 group-hover:shadow-2xl group-hover:shadow-cyan-500/40 transition-all duration-300 border border-cyan-500/30 group-hover:border-cyan-400/50 overflow-hidden">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 animate-pulse" />

              {/* Main lightning bolt */}
              <Zap className="relative h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)] transition-all duration-300 group-hover:scale-110" strokeWidth={2.5} fill="currentColor" />

              {/* Spark effects */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-300 rounded-full animate-ping" />
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">DealFinder</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {isLoaded && isSignedIn && (
              <Link href="/saved">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                </Button>
              </Link>
            )}

            {isLoaded && isSignedIn && isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}

            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
