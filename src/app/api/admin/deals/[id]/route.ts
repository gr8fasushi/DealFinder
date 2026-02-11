import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { dealUpdateSchema } from "@/lib/validations/deal";

// GET single deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
      with: {
        store: true,
        category: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

// PATCH update deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = dealUpdateSchema.parse(body);

    // Recalculate savings if prices are being updated
    let savingsAmount = undefined;
    let savingsPercent = undefined;

    if (validatedData.currentPrice || validatedData.originalPrice) {
      // Get current deal for existing prices
      const currentDeal = await db.query.deals.findFirst({
        where: eq(deals.id, dealId),
      });

      if (!currentDeal) {
        return NextResponse.json(
          { error: "Deal not found" },
          { status: 404 }
        );
      }

      const currentPrice = validatedData.currentPrice
        ? parseFloat(validatedData.currentPrice)
        : parseFloat(currentDeal.currentPrice);

      const originalPrice = validatedData.originalPrice
        ? parseFloat(validatedData.originalPrice)
        : currentDeal.originalPrice
        ? parseFloat(currentDeal.originalPrice)
        : null;

      if (originalPrice && originalPrice > currentPrice) {
        savingsAmount = originalPrice - currentPrice;
        savingsPercent = (savingsAmount / originalPrice) * 100;
      } else {
        savingsAmount = null;
        savingsPercent = null;
      }
    }

    const updateData: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (savingsAmount !== undefined) {
      updateData.savingsAmount =
        savingsAmount !== null ? savingsAmount.toFixed(2) : null;
      updateData.savingsPercent =
        savingsPercent !== null && savingsPercent !== undefined ? savingsPercent.toFixed(2) : null;
    }

    if (validatedData.expiresAt) {
      updateData.expiresAt = new Date(validatedData.expiresAt);
    }

    const [updatedDeal] = await db
      .update(deals)
      .set(updateData)
      .where(eq(deals.id, dealId))
      .returning();

    if (!updatedDeal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDeal);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

// DELETE deal (soft delete - sets isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    // Soft delete - set isActive to false
    const [updated] = await db
      .update(deals)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(deals.id, dealId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
