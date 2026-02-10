import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const storesData = await db.query.stores.findMany({
      where: eq(stores.isActive, true),
      orderBy: (stores, { asc }) => [asc(stores.name)],
    });

    return NextResponse.json(storesData);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
