"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Deal {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  currentPrice: string;
  originalPrice: string | null;
  savingsAmount: string | null;
  savingsPercent: string | null;
  affiliateUrl: string;
  brand: string | null;
  store: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

interface DealCardProps {
  deal: Deal;
  initialIsSaved?: boolean;
}

export function DealCard({ deal, initialIsSaved = false }: DealCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const savings = deal.savingsPercent
    ? Math.round(parseFloat(deal.savingsPercent))
    : null;

  const handleSaveToggle = async () => {
    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/deals/saved/${deal.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // Save
        const response = await fetch("/api/deals/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId: deal.id }),
        });

        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border-gray-200/60 bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
      <Link href={`/deals/${deal.id}`} className="block">
        {/* Deal Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            unoptimized
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Savings Badge */}
        {savings && savings > 0 && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 font-bold text-xs px-2.5 py-1 rounded-lg">
            -{savings}%
          </Badge>
        )}

        {/* Store Logo */}
        {deal.store.logoUrl && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md">
            <Image
              src={deal.store.logoUrl}
              alt={deal.store.name}
              width={24}
              height={24}
              unoptimized
              className="object-contain rounded"
            />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Brand */}
        {deal.brand && (
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
            {deal.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 leading-snug min-h-[2.5rem] text-gray-900">
          {deal.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-extrabold text-gray-900">
            ${parseFloat(deal.currentPrice).toFixed(2)}
          </span>
          {deal.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${parseFloat(deal.originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Savings Amount */}
        {deal.savingsAmount && parseFloat(deal.savingsAmount) > 0 && (
          <p className="text-sm font-semibold text-emerald-600">
            You save ${parseFloat(deal.savingsAmount).toFixed(2)}
          </p>
        )}
      </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Save Button */}
        <Button
          variant={isSaved ? "default" : "outline"}
          size="icon"
          className={`shrink-0 rounded-xl ${isSaved ? "" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveToggle();
          }}
          disabled={isLoading}
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
          />
        </Button>

        {/* View Deal Button */}
        <a
          href={deal.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 h-10 px-5 py-2"
        >
          View Deal
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
