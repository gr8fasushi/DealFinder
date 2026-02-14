import { db } from "@/lib/db";
import { deals, stores as storesTable, categories as categoriesTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { FilteredDeals } from "@/components/deals/FilteredDeals";
import { Sparkles, TrendingDown, Zap } from "lucide-react";
import { LightningStrikes } from "@/components/LightningStrikes";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch latest active deals for initial load
  const latestDeals = await db.query.deals.findMany({
    where: eq(deals.isActive, true),
    with: {
      store: true,
      category: true,
    },
    orderBy: desc(deals.createdAt),
    limit: 20,
  });

  // Fetch all active stores for filter
  const stores = await db.query.stores.findMany({
    where: eq(storesTable.isActive, true),
    orderBy: storesTable.name,
  });

  // Fetch all categories for filter
  const categories = await db.query.categories.findMany({
    orderBy: categoriesTable.name,
  });

  const featuredCount = latestDeals.filter((d) => d.isFeatured).length;

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 animate-gradient-shift text-white">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl" />

          {/* Random lightning strikes */}
          <LightningStrikes />
        </div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative container mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Title & subtitle */}
            <div className="min-w-0">
              <div className="animate-slide-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 backdrop-blur-sm border border-cyan-400/20 text-xs font-medium mb-4 shadow-lg shadow-cyan-500/10">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-cyan-100 font-semibold">Lightning-fast savings</span>
              </div>

              <h1 className="animate-slide-up-delayed text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-[1.1]">
                Strike the{" "}
                <span className="relative inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Best Deals
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl -z-10" />
                </span>
              </h1>

              <p className="animate-slide-up-delayed-2 text-sm sm:text-base text-blue-100/80 max-w-md leading-relaxed">
                Discover amazing discounts in a flash. We scan prices from top retailers so you don&apos;t have to.
              </p>
            </div>

            {/* Right: Stat pills */}
            <div className="animate-slide-up-delayed-2 flex flex-row lg:flex-col gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-sm shadow-xl">
                <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="font-bold text-white">{latestDeals.length}</span>
                <span className="text-blue-200">active deals</span>
              </div>
              {featuredCount > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-sm shadow-xl">
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-white">{featuredCount}</span>
                  <span className="text-blue-200">deals 20%+ off</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-sm shadow-xl">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-white">{stores.length} stores tracked</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Deals Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12 -mt-4">
        <FilteredDeals
          initialDeals={latestDeals as unknown as Parameters<typeof FilteredDeals>[0]["initialDeals"]}
          stores={stores.map((s) => ({ id: s.id, name: s.name, slug: s.slug }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        />
      </div>
    </main>
  );
}
