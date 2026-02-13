import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk modules before importing the module under test
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

import { checkAdminAccess } from "@/lib/auth-helpers";
import { auth, clerkClient } from "@clerk/nextjs/server";

const mockAuth = vi.mocked(auth);
const mockClerkClient = vi.mocked(clerkClient);

describe("checkAdminAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log/error in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 when no userId (not signed in)", async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const result = await checkAdminAccess();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(401);
      expect(result.error).toEqual({ error: "Unauthorized" });
    }
  });

  it("returns 403 when user has no admin role", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockClerkClient.mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          id: "user_123",
          emailAddresses: [{ emailAddress: "user@example.com" }],
          publicMetadata: { role: "user" },
        }),
      },
    } as any);

    const result = await checkAdminAccess();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(403);
      expect(result.error).toEqual({ error: "Forbidden" });
    }
  });

  it("returns 403 when publicMetadata has no role", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockClerkClient.mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          id: "user_123",
          emailAddresses: [{ emailAddress: "user@example.com" }],
          publicMetadata: {},
        }),
      },
    } as any);

    const result = await checkAdminAccess();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(403);
    }
  });

  it("returns authorized with userId when user is admin", async () => {
    mockAuth.mockResolvedValue({ userId: "user_admin" } as any);
    mockClerkClient.mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          id: "user_admin",
          emailAddresses: [{ emailAddress: "admin@example.com" }],
          publicMetadata: { role: "admin" },
        }),
      },
    } as any);

    const result = await checkAdminAccess();

    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.userId).toBe("user_admin");
    }
  });

  it("returns 500 when Clerk API throws an error", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockClerkClient.mockResolvedValue({
      users: {
        getUser: vi.fn().mockRejectedValue(new Error("Clerk API down")),
      },
    } as any);

    const result = await checkAdminAccess();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(500);
      expect(result.error).toEqual({ error: "Internal server error" });
    }
  });

  it("calls clerkClient with the correct userId", async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      id: "user_456",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      publicMetadata: { role: "admin" },
    });

    mockAuth.mockResolvedValue({ userId: "user_456" } as any);
    mockClerkClient.mockResolvedValue({
      users: { getUser: mockGetUser },
    } as any);

    await checkAdminAccess();

    expect(mockGetUser).toHaveBeenCalledWith("user_456");
  });
});
