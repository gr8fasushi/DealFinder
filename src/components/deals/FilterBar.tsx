"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  stores: { id: number; name: string; slug: string }[];
  categories: { id: number; name: string; slug: string }[];
}

export function FilterBar({ stores, categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [storeSlug, setStoreSlug] = useState(searchParams.get("store") || "");
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get("category") || ""
  );
  const [minDiscount, setMinDiscount] = useState(
    searchParams.get("minDiscount") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [featured, setFeatured] = useState(
    searchParams.get("featured") === "true"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "newest"
  );
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (storeSlug) params.set("store", storeSlug);
    if (categorySlug) params.set("category", categorySlug);
    if (minDiscount) params.set("minDiscount", minDiscount);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (featured) params.set("featured", "true");
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStoreSlug("");
    setCategorySlug("");
    setMinDiscount("");
    setMinPrice("");
    setMaxPrice("");
    setFeatured(false);
    setSortBy("newest");
    router.push("/");
  };

  const hasActiveFilters =
    search ||
    storeSlug ||
    categorySlug ||
    minDiscount ||
    minPrice ||
    maxPrice ||
    featured ||
    sortBy !== "newest";

  // Auto-apply search on enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 mb-8">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set("sortBy", e.target.value);
            router.push(`/?${params.toString()}`);
          }}
          className="px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="savings">Highest Discount</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl ${showFilters ? "" : "border-gray-200 hover:bg-gray-50"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
              Active
            </span>
          )}
        </Button>

        {/* Quick Clear Button - Always Visible When Filters Active */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Store Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Store
              </label>
              <select
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.slug}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Discount */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Minimum Discount
              </label>
              <select
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">Any Discount</option>
                <option value="10">10% or more</option>
                <option value="20">20% or more</option>
                <option value="30">30% or more</option>
                <option value="50">50% or more</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Min Price
              </label>
              <input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Max Price
              </label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Featured Only */}
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Featured Deals Only (20%+ off)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={applyFilters} className="flex-1 sm:flex-none rounded-xl">
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-xl"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
