import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { storeFormSchema } from "@/lib/validations/store";
import { checkAdminAccess } from "@/lib/auth-helpers";

// GET all stores
export async function GET() {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
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
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
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

    // Handle duplicate store name error
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: "A store with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
