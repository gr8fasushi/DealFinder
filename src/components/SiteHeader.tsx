"use client";

import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Tag, Heart, Shield } from "lucide-react";
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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
              <Tag className="h-4 w-4 text-white" />
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
