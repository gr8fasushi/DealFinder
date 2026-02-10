"use client";

import { useState } from "react";
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
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Deal Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}

        {/* Savings Badge */}
        {savings && savings > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600">
            {savings}% OFF
          </Badge>
        )}

        {/* Store Logo */}
        {deal.store.logoUrl && (
          <div className="absolute top-2 left-2 bg-white rounded-md p-1.5 shadow-sm">
            <Image
              src={deal.store.logoUrl}
              alt={deal.store.name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Brand */}
        {deal.brand && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {deal.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">
          {deal.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            ${parseFloat(deal.currentPrice).toFixed(2)}
          </span>
          {deal.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${parseFloat(deal.originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Savings Amount */}
        {deal.savingsAmount && parseFloat(deal.savingsAmount) > 0 && (
          <p className="text-sm font-medium text-green-600">
            Save ${parseFloat(deal.savingsAmount).toFixed(2)}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Save Button */}
        <Button
          variant={isSaved ? "default" : "outline"}
          size="icon"
          className="shrink-0"
          onClick={handleSaveToggle}
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
          className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          View Deal
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
}
