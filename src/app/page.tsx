import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { DealGrid } from "@/components/deals/DealGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch latest active deals
  const latestDeals = await db.query.deals.findMany({
    where: eq(deals.isActive, true),
    with: {
      store: true,
      category: true,
    },
    orderBy: desc(deals.createdAt),
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Find the Best Deals
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl">
            Discover amazing discounts from top retailers like Amazon, Walmart,
            Newegg, and more
          </p>
        </div>
      </div>

      {/* Deals Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Latest Deals</h2>
            <p className="text-muted-foreground">
              {latestDeals.length} amazing deals waiting for you
            </p>
          </div>
        </div>

        {/* Deal Grid */}
        <DealGrid deals={latestDeals as unknown as Parameters<typeof DealGrid>[0]["deals"]} />
      </div>
    </main>
  );
}
