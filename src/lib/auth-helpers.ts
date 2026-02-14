import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensure a user exists in the database by syncing from Clerk
 * If the user doesn't exist, create them. If they exist, update their info.
 * @param userId - Clerk user ID
 * @returns The user record from the database
 */
export async function ensureUserExists(userId: string) {
  try {
    // Check if user already exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // If user exists and was updated recently (within 24 hours), return it
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (existingUser && existingUser.updatedAt > oneDayAgo) {
      return existingUser;
    }

    // Fetch fresh user data from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const userData = {
      id: clerkUser.id,
      email:
        clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || "",
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
      role: (clerkUser.publicMetadata?.role as string) || "user",
      updatedAt: new Date(),
    };

    // Upsert user (insert or update)
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          role: userData.role,
          updatedAt: userData.updatedAt,
        },
      })
      .returning();

    return user;
  } catch (error) {
    console.error("[ensureUserExists] Error syncing user:", error);
    throw new Error("Failed to sync user data");
  }
}

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
