import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { storeFormSchema } from "@/lib/validations/store";

// GET all stores
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allStores = await db.query.stores.findMany({
      orderBy: (stores, { asc }) => [asc(stores.name)],
    });

    return NextResponse.json(allStores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

// POST create new store
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = storeFormSchema.parse(body);

    // Check if slug already exists
    const existingStore = await db.query.stores.findFirst({
      where: eq(stores.slug, validatedData.slug),
    });

    if (existingStore) {
      return NextResponse.json(
        { error: "A store with this slug already exists" },
        { status: 400 }
      );
    }

    // Create store
    const [newStore] = await db
      .insert(stores)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        logoUrl: validatedData.logoUrl || null,
        websiteUrl: validatedData.websiteUrl || null,
        affiliateProgram: validatedData.affiliateProgram || null,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newStore, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
