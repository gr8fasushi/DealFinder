import { describe, it, expect } from "vitest";
import { buildSearchQuery, getQuotaStats, resetDailyQuota } from "@/lib/services/youtube";

describe("buildSearchQuery", () => {
  it("appends 'review' to deal title", () => {
    const result = buildSearchQuery("Sony WH-1000XM5 Headphones");
    expect(result).toBe("Sony WH-1000XM5 Headphones review");
  });

  it("removes noise word 'deal'", () => {
    const result = buildSearchQuery("Sony Headphones deal");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes noise word 'off'", () => {
    const result = buildSearchQuery("50% off Sony Headphones");
    expect(result).toBe("50% Sony Headphones review");
  });

  it("removes noise word 'discount'", () => {
    const result = buildSearchQuery("Sony Headphones discount");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes noise word 'sale'", () => {
    const result = buildSearchQuery("Sony Headphones sale");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes noise word 'save'", () => {
    const result = buildSearchQuery("save on Sony Headphones");
    expect(result).toBe("on Sony Headphones review");
  });

  it("removes noise word 'special'", () => {
    const result = buildSearchQuery("special Sony Headphones");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes noise word 'offer'", () => {
    const result = buildSearchQuery("Sony Headphones offer");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes noise word 'promo'", () => {
    const result = buildSearchQuery("Sony Headphones promo");
    expect(result).toBe("Sony Headphones review");
  });

  it("removes multiple noise words", () => {
    const result = buildSearchQuery("Special deal - Save on Sony Headphones sale");
    expect(result).toBe("- on Sony Headphones review");
  });

  it("removes noise words case-insensitively", () => {
    const result = buildSearchQuery("DEAL on Sony SALE Headphones");
    expect(result).toBe("on Sony Headphones review");
  });

  it("prepends brand when provided", () => {
    const result = buildSearchQuery("WH-1000XM5 Headphones", "Sony");
    expect(result).toBe("Sony WH-1000XM5 Headphones review");
  });

  it("prepends brand and still removes noise words", () => {
    const result = buildSearchQuery("WH-1000XM5 Headphones deal", "Sony");
    expect(result).toBe("Sony WH-1000XM5 Headphones review");
  });

  it("handles empty title", () => {
    const result = buildSearchQuery("");
    expect(result).toBe("review");
  });

  it("handles title with only noise words", () => {
    const result = buildSearchQuery("deal sale promo");
    expect(result).toBe("review");
  });

  it("cleans up extra whitespace", () => {
    const result = buildSearchQuery("  Sony   Headphones   deal  ");
    expect(result).toBe("Sony Headphones review");
  });
});

describe("quota management", () => {
  it("returns initial quota stats", () => {
    resetDailyQuota();
    const stats = getQuotaStats();
    expect(stats.used).toBe(0);
    expect(stats.limit).toBe(10000);
    expect(stats.remaining).toBe(10000);
  });

  it("resets quota correctly", () => {
    resetDailyQuota();
    const stats = getQuotaStats();
    expect(stats.used).toBe(0);
    expect(stats.remaining).toBe(stats.limit);
  });
});
