"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

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
}

export function DealCard({ deal }: DealCardProps) {
  const savings = deal.savingsPercent
    ? Math.round(parseFloat(deal.savingsPercent))
    : null;

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
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement save deal functionality
            console.log("Save deal:", deal.id);
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* View Deal Button */}
        <Button asChild className="flex-1">
          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            View Deal
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
