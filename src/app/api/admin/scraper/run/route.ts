import { checkAdminAccess } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { runScrapers } from "@/lib/scrapers/coordinator";

export async function POST(request: NextRequest) {
  try {
    // Check for CRON_SECRET authentication (for automated jobs)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    let isAuthorized = false;

    if (authHeader && cronSecret) {
      const token = authHeader.replace("Bearer ", "");
      if (token === cronSecret) {
        isAuthorized = true;
        console.log("[Scraper] Authorized via CRON_SECRET");
      }
    }

    // If not authorized via CRON_SECRET, check admin access
    if (!isAuthorized) {
      const authCheck = await checkAdminAccess();
      if (!authCheck.authorized) {
        return NextResponse.json(authCheck.error, { status: authCheck.status });
      }
    }

    // Parse optional sources filter
    let sources: ("walmart" | "newegg" | "amazon")[] | undefined;
    try {
      const body = await request.json();
      if (body.sources && Array.isArray(body.sources)) {
        const valid = ["walmart", "newegg", "amazon"] as const;
        sources = body.sources.filter((s: string) =>
          valid.includes(s as (typeof valid)[number])
        );
      }
    } catch {
      // No body or invalid JSON — run all scrapers
    }

    const result = await runScrapers(sources);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error running scraper:", error);
    return NextResponse.json(
      { error: "Failed to run scraper" },
      { status: 500 }
    );
  }
}
