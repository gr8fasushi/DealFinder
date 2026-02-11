import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { categoryFormSchema } from "@/lib/validations/category";

// GET all categories
export async function GET() {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const allCategories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = categoryFormSchema.parse(body);

    // Check if slug already exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, validatedData.slug),
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // If parent ID is provided, verify it exists
    if (validatedData.parentId) {
      const parentCategory = await db.query.categories.findFirst({
        where: eq(categories.id, validatedData.parentId),
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 }
        );
      }
    }

    // Create category
    const [newCategory] = (await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        parentId: validatedData.parentId || null,
      })
      .returning()) as unknown[];

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
