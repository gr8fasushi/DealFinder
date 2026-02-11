import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { dealFormSchema } from "@/lib/validations/deal";

// GET all deals (admin view - includes inactive)
export async function GET() {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const allDeals = await db.query.deals.findMany({
      with: {
        store: true,
        category: true,
      },
      orderBy: [desc(deals.createdAt)],
    });

    return NextResponse.json(allDeals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

// POST create new deal
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = dealFormSchema.parse(body);

    // Calculate savings
    const currentPrice = parseFloat(validatedData.currentPrice);
    const originalPrice = validatedData.originalPrice
      ? parseFloat(validatedData.originalPrice)
      : null;

    let savingsAmount = null;
    let savingsPercent = null;

    if (originalPrice && originalPrice > currentPrice) {
      savingsAmount = originalPrice - currentPrice;
      savingsPercent = (savingsAmount / originalPrice) * 100;
    }

    // Create deal
    const [newDeal] = await db
      .insert(deals)
      .values({
        title: validatedData.title,
        description: validatedData.description || null,
        imageUrl: validatedData.imageUrl || null,
        storeId: validatedData.storeId,
        categoryId: validatedData.categoryId || null,
        currentPrice: validatedData.currentPrice,
        originalPrice: validatedData.originalPrice || null,
        savingsAmount: savingsAmount?.toFixed(2) || null,
        savingsPercent: savingsPercent?.toFixed(2) || null,
        productUrl: validatedData.productUrl,
        affiliateUrl: validatedData.affiliateUrl,
        brand: validatedData.brand || null,
        sku: validatedData.sku || null,
        externalId: validatedData.externalId || null,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        expiresAt: validatedData.expiresAt
          ? new Date(validatedData.expiresAt)
          : null,
        source: "manual",
        createdBy: authCheck.userId,
      })
      .returning();

    return NextResponse.json(newDeal, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
