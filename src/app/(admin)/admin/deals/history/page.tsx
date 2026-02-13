import { db } from "@/lib/db";
import { deals, stores, categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { checkAdminAccess } from "@/lib/auth-helpers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function DealsHistoryPage() {
  await checkAdminAccess();

  // Fetch ALL deals (active and inactive) ordered by most recently updated
  const allDeals = await db
    .select({
      id: deals.id,
      title: deals.title,
      currentPrice: deals.currentPrice,
      originalPrice: deals.originalPrice,
      savingsPercent: deals.savingsPercent,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      expiresAt: deals.expiresAt,
      source: deals.source,
      productUrl: deals.productUrl,
      storeName: stores.name,
      categoryName: categories.name,
    })
    .from(deals)
    .leftJoin(stores, eq(deals.storeId, stores.id))
    .leftJoin(categories, eq(deals.categoryId, categories.id))
    .orderBy(desc(deals.updatedAt))
    .limit(200);

  const activeDeals = allDeals.filter((d) => d.isActive);
  const expiredDeals = allDeals.filter((d) => !d.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deal History</h1>
          <p className="text-muted-foreground mt-1">
            View all deals including expired ones
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/deals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Active Deals
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold">{allDeals.length}</div>
          <div className="text-sm text-muted-foreground">Total Deals</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {activeDeals.length}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {expiredDeals.length}
          </div>
          <div className="text-sm text-muted-foreground">Expired</div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Activated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expired
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className={!deal.isActive ? "bg-gray-50/50" : ""}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={deal.isActive ? "default" : "secondary"}>
                        {deal.isActive ? "Active" : "Expired"}
                      </Badge>
                      {deal.isFeatured && (
                        <Badge variant="outline" className="text-xs">
                          ⭐
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <div className="font-medium line-clamp-1">
                        {deal.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deal.categoryName || "Uncategorized"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{deal.storeName || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {deal.source}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">${deal.currentPrice}</div>
                    {deal.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {deal.savingsPercent ? (
                      <span className="font-medium text-green-600">
                        {deal.savingsPercent}% off
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {deal.expiresAt ? (
                      <span className="text-orange-600">
                        {new Date(deal.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/deals/${deal.id}`}>
                          View
                        </Link>
                      </Button>
                      {deal.productUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={deal.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {allDeals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No deals found in the database
        </div>
      )}
    </div>
  );
}
