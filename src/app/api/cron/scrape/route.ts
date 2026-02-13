import { NextRequest, NextResponse } from "next/server";
import { runScrapers } from "@/lib/scrapers/coordinator";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runScrapers();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in cron scrape:", error);
    return NextResponse.json(
      { error: "Cron scrape failed" },
      { status: 500 }
    );
  }
}
