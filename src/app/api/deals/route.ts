import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals, stores, categories } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const storeSlug = searchParams.get("store");
    const categorySlug = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build where conditions
    const conditions = [eq(deals.isActive, true)];

    if (storeSlug) {
      const store = await db.query.stores.findFirst({
        where: eq(stores.slug, storeSlug),
      });
      if (store) {
        conditions.push(eq(deals.storeId, store.id));
      }
    }

    if (categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (category) {
        conditions.push(eq(deals.categoryId, category.id));
      }
    }

    if (minPrice) {
      conditions.push(gte(deals.currentPrice, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(deals.currentPrice, maxPrice));
    }

    if (search) {
      conditions.push(
        sql`${deals.title} ILIKE ${`%${search}%`} OR ${deals.description} ILIKE ${`%${search}%`}`
      );
    }

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case "price-asc":
        orderBy = deals.currentPrice;
        break;
      case "price-desc":
        orderBy = desc(deals.currentPrice);
        break;
      case "savings":
        orderBy = desc(deals.savingsPercent);
        break;
      default:
        orderBy = desc(deals.createdAt);
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(deals)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    // Get paginated deals with relations
    const dealsData = await db.query.deals.findMany({
      where: and(...conditions),
      with: {
        store: true,
        category: true,
      },
      orderBy,
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      deals: dealsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
