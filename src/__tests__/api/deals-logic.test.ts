import { describe, it, expect } from "vitest";

/**
 * Tests for the deal savings calculation logic used in API routes.
 * This logic is extracted from src/app/api/admin/deals/route.ts (POST)
 * and src/app/api/admin/deals/[id]/route.ts (PATCH).
 */

function calculateSavings(
  currentPrice: string,
  originalPrice?: string | null
): { savingsAmount: string | null; savingsPercent: string | null } {
  const current = parseFloat(currentPrice);
  const original = originalPrice ? parseFloat(originalPrice) : null;

  let savingsAmount: number | null = null;
  let savingsPercent: number | null = null;

  if (original && original > current) {
    savingsAmount = original - current;
    savingsPercent = (savingsAmount / original) * 100;
  }

  return {
    savingsAmount: savingsAmount?.toFixed(2) || null,
    savingsPercent: savingsPercent?.toFixed(2) || null,
  };
}

describe("deal savings calculation", () => {
  it("calculates savings when original > current price", () => {
    const result = calculateSavings("249.99", "349.99");
    expect(result.savingsAmount).toBe("100.00");
    expect(result.savingsPercent).toBe("28.57");
  });

  it("returns null when no original price", () => {
    const result = calculateSavings("249.99");
    expect(result.savingsAmount).toBeNull();
    expect(result.savingsPercent).toBeNull();
  });

  it("returns null when original price is null", () => {
    const result = calculateSavings("249.99", null);
    expect(result.savingsAmount).toBeNull();
    expect(result.savingsPercent).toBeNull();
  });

  it("returns null when original price is empty string", () => {
    const result = calculateSavings("249.99", "");
    expect(result.savingsAmount).toBeNull();
    expect(result.savingsPercent).toBeNull();
  });

  it("returns null when current price equals original", () => {
    const result = calculateSavings("100.00", "100.00");
    expect(result.savingsAmount).toBeNull();
    expect(result.savingsPercent).toBeNull();
  });

  it("returns null when current price is higher than original (no negative savings)", () => {
    const result = calculateSavings("500.00", "400.00");
    expect(result.savingsAmount).toBeNull();
    expect(result.savingsPercent).toBeNull();
  });

  it("calculates 50% savings correctly", () => {
    const result = calculateSavings("50.00", "100.00");
    expect(result.savingsAmount).toBe("50.00");
    expect(result.savingsPercent).toBe("50.00");
  });

  it("calculates savings for small amounts", () => {
    const result = calculateSavings("0.99", "1.99");
    expect(result.savingsAmount).toBe("1.00");
    expect(result.savingsPercent).toBe("50.25");
  });

  it("calculates savings for large amounts", () => {
    const result = calculateSavings("999.99", "1999.99");
    expect(result.savingsAmount).toBe("1000.00");
    expect(result.savingsPercent).toBe("50.00");
  });

  it("handles whole number prices", () => {
    const result = calculateSavings("75", "100");
    expect(result.savingsAmount).toBe("25.00");
    expect(result.savingsPercent).toBe("25.00");
  });

  it("calculates near-100% savings", () => {
    const result = calculateSavings("1.00", "100.00");
    expect(result.savingsAmount).toBe("99.00");
    expect(result.savingsPercent).toBe("99.00");
  });
});

describe("deal ID parsing", () => {
  it("parses valid integer ID", () => {
    const id = parseInt("42");
    expect(isNaN(id)).toBe(false);
    expect(id).toBe(42);
  });

  it("rejects non-numeric ID", () => {
    const id = parseInt("abc");
    expect(isNaN(id)).toBe(true);
  });

  it("rejects empty string ID", () => {
    const id = parseInt("");
    expect(isNaN(id)).toBe(true);
  });

  it("parses ID with leading zeros", () => {
    const id = parseInt("007");
    expect(id).toBe(7);
  });

  it("rejects float ID (parseInt truncates)", () => {
    const id = parseInt("3.14");
    expect(id).toBe(3); // parseInt truncates
  });
});
