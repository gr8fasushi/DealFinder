"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DealGrid } from "@/components/deals/DealGrid";
import { FilterBar } from "@/components/deals/FilterBar";
import { Loader2 } from "lucide-react";

interface Deal {
  id: number;
  title: string;
  currentPrice: string;
  originalPrice: string | null;
  savingsPercent: string | null;
  imageUrl: string | null;
  productUrl: string;
  isFeatured: boolean;
  isSaved?: boolean;
  store: { name: string; logoUrl: string | null } | null;
  category: { name: string } | null;
}

interface FilteredDealsProps {
  initialDeals: Deal[];
  stores: { id: number; name: string; slug: string }[];
  categories: { id: number; name: string; slug: string }[];
}

export function FilteredDeals({
  initialDeals,
  stores,
  categories,
}: FilteredDealsProps) {
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialDeals.length);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/deals?${params.toString()}`);
        const data = await response.json();
        setDeals(data.deals);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [searchParams]);

  return (
    <>
      <FilterBar stores={stores} categories={categories} />

      {/* Results Count */}
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.toString() ? "Filtered Deals" : "Latest Deals"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </span>
            ) : (
              <span>{total} {total === 1 ? "deal" : "deals"} found</span>
            )}
          </p>
        </div>
      </div>

      {/* Deal Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-400">Finding the best deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl font-semibold text-gray-700">No deals found</p>
          <p className="text-gray-400 mt-2">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <DealGrid deals={deals as unknown as Parameters<typeof DealGrid>[0]["deals"]} />
      )}
    </>
  );
}
