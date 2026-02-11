import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals, stores, categories } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

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

    return NextResponse.json({
      totalDeals: dealsCount.total,
      activeDeals: dealsCount.active,
      totalStores: storesCount.total,
      activeStores: storesCount.active,
      totalCategories: categoriesCount,
      recentDeals,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
