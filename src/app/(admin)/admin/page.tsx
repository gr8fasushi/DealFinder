import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { deals, stores, categories } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { checkAdminAccess } from "@/lib/auth-helpers";
import { ScraperPanel } from "@/components/admin/ScraperPanel";

interface RecentDeal {
  id: number;
  title: string;
  currentPrice: string;
  originalPrice: string | null;
  isActive: boolean;
  store: { name: string } | null;
  category: { name: string } | null;
}

interface Stats {
  totalDeals: number;
  activeDeals: number;
  totalStores: number;
  activeStores: number;
  totalCategories: number;
  recentDeals: RecentDeal[];
}

async function getStats(): Promise<Stats> {
  // Get total and active deals count
  const dealsCountResult = await db
    .select({
      total: sql<number>`cast(count(*) as integer)`,
      active: sql<number>`cast(count(*) filter (where ${deals.isActive} = true) as integer)`,
    })
    .from(deals);

  const dealsCount = dealsCountResult[0] || { total: 0, active: 0 };

  // Get total and active stores count
  const storesCountResult = await db
    .select({
      total: sql<number>`cast(count(*) as integer)`,
      active: sql<number>`cast(count(*) filter (where ${stores.isActive} = true) as integer)`,
    })
    .from(stores);

  const storesCount = storesCountResult[0] || { total: 0, active: 0 };

  // Get total categories count
  const categoriesCountResult = await db
    .select({
      total: sql<number>`cast(count(*) as integer)`,
    })
    .from(categories);

  const categoriesCount = categoriesCountResult[0]?.total || 0;

  // Get recent deals
  const recentDeals = await db.query.deals.findMany({
    with: {
      store: true,
      category: true,
    },
    orderBy: [desc(deals.createdAt)],
    limit: 10,
  });

  return {
    totalDeals: dealsCount.total,
    activeDeals: dealsCount.active,
    totalStores: storesCount.total,
    activeStores: storesCount.active,
    totalCategories: categoriesCount,
    recentDeals: recentDeals as RecentDeal[],
  };
}

export default async function AdminDashboard() {
  // Check admin access
  const access = await checkAdminAccess();
  if (!access.authorized) {
    redirect("/sign-in");
  }

  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the DealFinder admin panel
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/deals/new">
            <Button className="w-full h-auto py-6 flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Add New Deal</span>
            </Button>
          </Link>
          <Link href="/admin/stores/new">
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Add New Store</span>
            </Button>
          </Link>
          <Link href="/admin/categories/new">
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Add New Category</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Web Scraper */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Web Scraper
        </h2>
        <ScraperPanel />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDeals.length > 0 ? (
              <div className="space-y-4">
                {stats.recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{deal.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {deal.store?.name}
                        </Badge>
                        {deal.category && (
                          <Badge variant="secondary" className="text-xs">
                            {deal.category.name}
                          </Badge>
                        )}
                        <Badge
                          variant={deal.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {deal.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${parseFloat(deal.currentPrice).toFixed(2)}
                      </div>
                      {deal.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${parseFloat(deal.originalPrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No deals yet. Create your first deal to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
