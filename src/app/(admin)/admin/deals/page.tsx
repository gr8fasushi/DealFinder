import Link from "next/link";
import { Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealsTable } from "@/components/admin/DealsTable";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

async function getDeals() {
  // Only show active deals on the main page
  const allDeals = await db.query.deals.findMany({
    where: eq(deals.isActive, true),
    with: {
      store: true,
      category: true,
    },
    orderBy: [desc(deals.createdAt)],
  });
  return allDeals;
}

export default async function DealsPage() {
  const dealsData = await getDeals();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Deals</h1>
          <p className="text-gray-600 mt-2">
            Manage currently active deals (view history for expired deals)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/deals/history">
              <History className="h-4 w-4 mr-2" />
              View History
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/deals/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Link>
          </Button>
        </div>
      </div>

      <DealsTable deals={dealsData} />
    </div>
  );
}
