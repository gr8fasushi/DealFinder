import { describe, it, expect } from "vitest";
import {
  parsePrice,
  calculateSavings,
  sanitizeUrl,
  truncate,
  getRandomUserAgent,
} from "@/lib/scrapers/utils";

describe("parsePrice", () => {
  it("parses dollar amount strings", () => {
    expect(parsePrice("$29.99")).toBe(29.99);
    expect(parsePrice("$1,299.00")).toBe(1299.0);
    expect(parsePrice("$0.99")).toBe(0.99);
  });

  it("parses plain number strings", () => {
    expect(parsePrice("29.99")).toBe(29.99);
    expect(parsePrice("100")).toBe(100);
  });

  it("handles text with embedded prices", () => {
    expect(parsePrice("Now $49.99")).toBe(49.99);
    expect(parsePrice("Price: $199.99")).toBe(199.99);
  });

  it("returns null for invalid inputs", () => {
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("free")).toBeNull();
    expect(parsePrice("$0.00")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
  });

  it("rounds to 2 decimal places", () => {
    expect(parsePrice("$19.99")).toBe(19.99);
    expect(parsePrice("$9.50")).toBe(9.5);
  });
});

describe("calculateSavings", () => {
  it("calculates savings correctly", () => {
    const result = calculateSavings(79.99, 99.99);
    expect(result).not.toBeNull();
    expect(result!.savingsAmount).toBe(20);
    expect(result!.savingsPercent).toBeCloseTo(20.0, 0);
  });

  it("handles large discounts", () => {
    const result = calculateSavings(25, 100);
    expect(result).not.toBeNull();
    expect(result!.savingsAmount).toBe(75);
    expect(result!.savingsPercent).toBe(75);
  });

  it("returns null when no original price", () => {
    expect(calculateSavings(29.99)).toBeNull();
    expect(calculateSavings(29.99, undefined)).toBeNull();
  });

  it("returns null when original <= current", () => {
    expect(calculateSavings(100, 100)).toBeNull();
    expect(calculateSavings(100, 50)).toBeNull();
  });
});

describe("sanitizeUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(sanitizeUrl("https://example.com/page", "https://base.com")).toBe(
      "https://example.com/page"
    );
  });

  it("prepends https to protocol-relative URLs", () => {
    expect(sanitizeUrl("//cdn.example.com/img.jpg", "https://base.com")).toBe(
      "https://cdn.example.com/img.jpg"
    );
  });

  it("prepends base URL to root-relative paths", () => {
    expect(sanitizeUrl("/products/123", "https://walmart.com")).toBe(
      "https://walmart.com/products/123"
    );
  });

  it("prepends base URL to relative paths", () => {
    expect(sanitizeUrl("products/123", "https://walmart.com")).toBe(
      "https://walmart.com/products/123"
    );
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("a very long string that exceeds the limit", 20)).toBe(
      "a very long strin..."
    );
  });

  it("handles exact length", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });
});

describe("getRandomUserAgent", () => {
  it("returns a non-empty string", () => {
    const ua = getRandomUserAgent();
    expect(ua).toBeTruthy();
    expect(typeof ua).toBe("string");
  });

  it("returns a browser-like user agent", () => {
    const ua = getRandomUserAgent();
    expect(ua).toContain("Mozilla");
  });
});
