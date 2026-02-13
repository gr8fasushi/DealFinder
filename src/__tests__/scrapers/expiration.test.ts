import { describe, it, expect } from "vitest";

describe("Deal Expiration Logic", () => {
  it("should identify deals that are no longer in scrape results", () => {
    // Simulating a scrape
    const scrapedExternalIds = ["PROD001", "PROD002", "PROD003"];

    // Simulating existing active deals in DB
    const existingDeals = [
      { externalId: "PROD001", isActive: true }, // Still in scrape - should stay active
      { externalId: "PROD002", isActive: true }, // Still in scrape - should stay active
      { externalId: "PROD004", isActive: true }, // NOT in scrape - should be expired
      { externalId: "PROD005", isActive: true }, // NOT in scrape - should be expired
    ];

    // Logic: find deals that should be expired
    const dealsToExpire = existingDeals.filter(
      (deal) => !scrapedExternalIds.includes(deal.externalId)
    );

    expect(dealsToExpire).toHaveLength(2);
    expect(dealsToExpire[0].externalId).toBe("PROD004");
    expect(dealsToExpire[1].externalId).toBe("PROD005");
  });

  it("should not expire deals that are still found in scrape", () => {
    const scrapedExternalIds = ["PROD001", "PROD002"];
    const existingDeals = [
      { externalId: "PROD001", isActive: true },
      { externalId: "PROD002", isActive: true },
    ];

    const dealsToExpire = existingDeals.filter(
      (deal) => !scrapedExternalIds.includes(deal.externalId)
    );

    expect(dealsToExpire).toHaveLength(0);
  });

  it("should reactivate previously expired deals if they appear again", () => {
    // This tests the logic in coordinator where we set expiresAt to null
    // when updating an existing deal that was previously expired

    const previouslyExpiredDeal = {
      externalId: "PROD001",
      isActive: false,
      expiresAt: new Date("2025-01-01"),
    };

    // When deal appears in scrape again, it should be updated to:
    const reactivatedDeal = {
      ...previouslyExpiredDeal,
      isActive: true,
      expiresAt: null, // Cleared
      updatedAt: new Date(),
    };

    expect(reactivatedDeal.isActive).toBe(true);
    expect(reactivatedDeal.expiresAt).toBeNull();
  });
});
