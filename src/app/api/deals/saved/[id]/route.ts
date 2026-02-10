import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedDeals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Unsave a deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    // Find and delete the saved deal
    const deleted = await db
      .delete(savedDeals)
      .where(
        and(eq(savedDeals.userId, userId), eq(savedDeals.dealId, dealId))
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Saved deal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsaving deal:", error);
    return NextResponse.json(
      { error: "Failed to unsave deal" },
      { status: 500 }
    );
  }
}
