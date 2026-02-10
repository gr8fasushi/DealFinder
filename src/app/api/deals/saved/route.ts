import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedDeals, deals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Get user's saved deals
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSavedDeals = await db.query.savedDeals.findMany({
      where: eq(savedDeals.userId, userId),
      with: {
        deal: {
          with: {
            store: true,
            category: true,
          },
        },
      },
      orderBy: (savedDeals, { desc }) => [desc(savedDeals.createdAt)],
    });

    return NextResponse.json(userSavedDeals);
  } catch (error) {
    console.error("Error fetching saved deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved deals" },
      { status: 500 }
    );
  }
}

// Save a deal
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dealId } = body;

    if (!dealId) {
      return NextResponse.json(
        { error: "Deal ID is required" },
        { status: 400 }
      );
    }

    // Check if deal exists
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Check if already saved
    const existing = await db.query.savedDeals.findFirst({
      where: and(
        eq(savedDeals.userId, userId),
        eq(savedDeals.dealId, dealId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Deal already saved" },
        { status: 400 }
      );
    }

    // Save the deal
    const [savedDeal] = await db
      .insert(savedDeals)
      .values({
        userId,
        dealId,
      })
      .returning();

    return NextResponse.json(savedDeal);
  } catch (error) {
    console.error("Error saving deal:", error);
    return NextResponse.json(
      { error: "Failed to save deal" },
      { status: 500 }
    );
  }
}
