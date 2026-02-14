import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/saved(.*)",
  "/profile(.*)",
  "/api/deals/saved(.*)",
  "/api/user(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
const isScraperEndpoint = createRouteMatcher(["/api/admin/scraper/run"]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware entirely for scraper endpoint (auth handled in route)
  if (isScraperEndpoint(req)) {
    return NextResponse.next();
  }

  // For other admin API routes, check Clerk authentication
  if (isAdminApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Fetch user from Clerk to get public metadata
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userRole = user.publicMetadata?.role as string | undefined;

      if (userRole !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // For non-admin-API routes, get auth normally
  const { userId } = await auth();

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For admin pages, just require authentication (role check happens in page component)
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
