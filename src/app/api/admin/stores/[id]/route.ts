import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { storeUpdateSchema } from "@/lib/validations/store";

// GET single store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { id } = await params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

// PATCH update store
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { id } = await params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = storeUpdateSchema.parse(body);

    // Check if slug is being updated and if it conflicts
    if (validatedData.slug) {
      const existingStore = await db.query.stores.findFirst({
        where: eq(stores.slug, validatedData.slug),
      });

      if (existingStore && existingStore.id !== storeId) {
        return NextResponse.json(
          { error: "A store with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const [updatedStore] = await db
      .update(stores)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId))
      .returning();

    if (!updatedStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStore);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error updating store:", error);
    return NextResponse.json(
      { error: "Failed to update store" },
      { status: 500 }
    );
  }
}

// DELETE store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { id } = await params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    const deleted = (await db
      .delete(stores)
      .where(eq(stores.id, storeId))
      .returning()) as unknown[];

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}
