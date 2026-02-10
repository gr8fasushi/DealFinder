"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, SlidersHorizontal } from "lucide-react";

interface Store {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface DealFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  stores: string[];
  categories: string[];
  minPrice: string;
  maxPrice: string;
  search: string;
}

export function DealFilters({ onFilterChange }: DealFiltersProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    stores: [],
    categories: [],
    minPrice: "",
    maxPrice: "",
    search: "",
  });

  // Fetch stores and categories
  useEffect(() => {
    Promise.all([
      fetch("/api/stores").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([storesData, categoriesData]) => {
      setStores(storesData);
      setCategories(categoriesData);
    });
  }, []);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStore = (slug: string) => {
    const newStores = filters.stores.includes(slug)
      ? filters.stores.filter((s) => s !== slug)
      : [...filters.stores, slug];
    updateFilters({ stores: newStores });
  };

  const toggleCategory = (slug: string) => {
    const newCategories = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    updateFilters({ categories: newCategories });
  };

  const clearFilters = () => {
    updateFilters({
      stores: [],
      categories: [],
      minPrice: "",
      maxPrice: "",
      search: "",
    });
  };

  const activeFilterCount =
    filters.stores.length +
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2" variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <div
        className={`space-y-6 ${isOpen || "hidden lg:block"} bg-card border rounded-lg p-4`}
      >
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Search deals..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
              className="w-full"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Stores */}
        <div>
          <label className="text-sm font-medium mb-2 block">Stores</label>
          <div className="flex flex-wrap gap-2">
            {stores.map((store) => (
              <Badge
                key={store.id}
                variant={
                  filters.stores.includes(store.slug) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleStore(store.slug)}
              >
                {store.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-sm font-medium mb-2 block">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={
                  filters.categories.includes(category.slug)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleCategory(category.slug)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
