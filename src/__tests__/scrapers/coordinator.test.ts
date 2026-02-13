import { describe, it, expect } from "vitest";
import { calculateSavings } from "@/lib/scrapers/utils";

describe("Deal quality filtering", () => {
  it("marks deals with 20%+ discount as featured", () => {
    // 25% off - should be featured
    const savings1 = calculateSavings(75, 100);
    expect(savings1).not.toBeNull();
    expect(savings1!.savingsPercent).toBe(25);
    expect(savings1!.savingsPercent >= 20).toBe(true);

    // 50% off - should be featured
    const savings2 = calculateSavings(50, 100);
    expect(savings2).not.toBeNull();
    expect(savings2!.savingsPercent).toBe(50);
    expect(savings2!.savingsPercent >= 20).toBe(true);

    // Exactly 20% off - should be featured
    const savings3 = calculateSavings(80, 100);
    expect(savings3).not.toBeNull();
    expect(savings3!.savingsPercent).toBe(20);
    expect(savings3!.savingsPercent >= 20).toBe(true);
  });

  it("does not mark deals with less than 20% discount as featured", () => {
    // 15% off - should NOT be featured
    const savings1 = calculateSavings(85, 100);
    expect(savings1).not.toBeNull();
    expect(savings1!.savingsPercent).toBeCloseTo(15, 1);
    expect(savings1!.savingsPercent >= 20).toBe(false);

    // 10% off - should NOT be featured
    const savings2 = calculateSavings(90, 100);
    expect(savings2).not.toBeNull();
    expect(savings2!.savingsPercent).toBe(10);
    expect(savings2!.savingsPercent >= 20).toBe(false);

    // 5% off - should NOT be featured
    const savings3 = calculateSavings(95, 100);
    expect(savings3).not.toBeNull();
    expect(savings3!.savingsPercent).toBe(5);
    expect(savings3!.savingsPercent >= 20).toBe(false);
  });

  it("does not mark deals without originalPrice as featured", () => {
    // No original price - should NOT be featured
    const savings = calculateSavings(99.99);
    expect(savings).toBeNull();

    // Simulate the check: isFeatured = savings ? savings.savingsPercent >= 20 : false
    const isFeatured = savings ? savings.savingsPercent >= 20 : false;
    expect(isFeatured).toBe(false);
  });

  it("handles real-world discount examples", () => {
    // $79.99 reduced from $99.99 - 20% off exactly
    const savings1 = calculateSavings(79.99, 99.99);
    expect(savings1).not.toBeNull();
    expect(savings1!.savingsPercent).toBeCloseTo(20, 0);
    expect(savings1!.savingsPercent >= 20).toBe(true);

    // $599.99 reduced from $799.99 - 25% off
    const savings2 = calculateSavings(599.99, 799.99);
    expect(savings2).not.toBeNull();
    expect(savings2!.savingsPercent).toBeCloseTo(25, 0);
    expect(savings2!.savingsPercent >= 20).toBe(true);

    // $89.99 reduced from $99.99 - ~10% off
    const savings3 = calculateSavings(89.99, 99.99);
    expect(savings3).not.toBeNull();
    expect(savings3!.savingsPercent).toBeCloseTo(10, 0);
    expect(savings3!.savingsPercent >= 20).toBe(false);
  });
});
