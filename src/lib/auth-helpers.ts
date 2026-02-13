import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Check if the current user has admin role
 * @returns Object with userId if authorized, or error response if not
 */
export async function checkAdminAccess() {
  const { userId } = await auth();

  if (!userId) {
    return {
      authorized: false,
      error: { error: "Unauthorized" },
      status: 401,
    } as const;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string | undefined;

    if (userRole !== "admin") {
      return {
        authorized: false,
        error: { error: "Forbidden" },
        status: 403,
      } as const;
    }

    return {
      authorized: true,
      userId,
    } as const;
  } catch (error) {
    console.error("[checkAdminAccess] Error fetching user:", error);
    return {
      authorized: false,
      error: { error: "Internal server error" },
      status: 500,
    } as const;
  }
}
