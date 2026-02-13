import { describe, it, expect } from "vitest";
import { dealFormSchema, dealUpdateSchema } from "@/lib/validations/deal";

const validDeal = {
  title: "Sony WH-1000XM5 Headphones",
  storeId: 1,
  currentPrice: "249.99",
  productUrl: "https://amazon.com/product/123",
  affiliateUrl: "https://amazon.com/affiliate/123",
  isActive: true,
  isFeatured: false,
};

describe("dealFormSchema", () => {
  it("accepts valid deal with required fields only", () => {
    const result = dealFormSchema.safeParse(validDeal);
    expect(result.success).toBe(true);
  });

  it("accepts valid deal with all optional fields", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      description: "Great noise-cancelling headphones",
      imageUrl: "https://example.com/image.jpg",
      categoryId: 5,
      originalPrice: "349.99",
      brand: "Sony",
      sku: "WH1000XM5",
      externalId: "B09XS7JWHH",
      expiresAt: "2026-03-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  // Title validation
  it("rejects empty title", () => {
    const result = dealFormSchema.safeParse({ ...validDeal, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 500 characters", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      title: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title, ...noTitle } = validDeal;
    const result = dealFormSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  // Price validation
  it("accepts whole number price", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "100",
    });
    expect(result.success).toBe(true);
  });

  it("accepts price with one decimal place", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "99.9",
    });
    expect(result.success).toBe(true);
  });

  it("accepts price with two decimal places", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "99.99",
    });
    expect(result.success).toBe(true);
  });

  it("rejects price with three decimal places", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "99.999",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "-10.00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric price", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      currentPrice: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string originalPrice (optional)", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      originalPrice: "",
    });
    expect(result.success).toBe(true);
  });

  // URL validation
  it("rejects invalid productUrl", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      productUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid affiliateUrl", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      affiliateUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string imageUrl (optional)", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      imageUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid imageUrl", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      imageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  // StoreId validation
  it("rejects missing storeId", () => {
    const { storeId, ...noStore } = validDeal;
    const result = dealFormSchema.safeParse(noStore);
    expect(result.success).toBe(false);
  });

  // Boolean fields
  it("rejects non-boolean isActive", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      isActive: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean isFeatured", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      isFeatured: 1,
    });
    expect(result.success).toBe(false);
  });

  // Optional string fields accept empty strings
  it("accepts empty string for optional string fields", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      description: "",
      brand: "",
      sku: "",
      externalId: "",
      expiresAt: "",
    });
    expect(result.success).toBe(true);
  });

  // CategoryId nullable
  it("accepts null categoryId", () => {
    const result = dealFormSchema.safeParse({
      ...validDeal,
      categoryId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("dealUpdateSchema (partial)", () => {
  it("accepts updating only title", () => {
    const result = dealUpdateSchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
  });

  it("accepts updating only price", () => {
    const result = dealUpdateSchema.safeParse({ currentPrice: "199.99" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no fields to update)", () => {
    const result = dealUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates field constraints on partial updates", () => {
    const result = dealUpdateSchema.safeParse({ currentPrice: "abc" });
    expect(result.success).toBe(false);
  });
});
