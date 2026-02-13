import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scraperLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const logs = await db
      .select()
      .from(scraperLogs)
      .orderBy(desc(scraperLogs.startedAt))
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching scraper logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch scraper logs" },
      { status: 500 }
    );
  }
}
