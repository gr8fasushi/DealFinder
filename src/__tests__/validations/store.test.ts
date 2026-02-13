import { describe, it, expect } from "vitest";
import { storeFormSchema, storeUpdateSchema } from "@/lib/validations/store";

const validStore = {
  name: "Amazon",
  slug: "amazon",
  isActive: true,
};

describe("storeFormSchema", () => {
  it("accepts valid store with required fields", () => {
    const result = storeFormSchema.safeParse(validStore);
    expect(result.success).toBe(true);
  });

  it("accepts valid store with all optional fields", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      logoUrl: "https://amazon.com/logo.png",
      websiteUrl: "https://amazon.com",
      affiliateProgram: "amazon",
    });
    expect(result.success).toBe(true);
  });

  // Name validation
  it("rejects empty name", () => {
    const result = storeFormSchema.safeParse({ ...validStore, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 100 characters", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  // Slug validation
  it("rejects empty slug", () => {
    const result = storeFormSchema.safeParse({ ...validStore, slug: "" });
    expect(result.success).toBe(false);
  });

  it("accepts slug with lowercase letters, numbers, and hyphens", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      slug: "best-buy-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      slug: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      slug: "best buy",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with special characters", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      slug: "amazon_store!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug exceeding 100 characters", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      slug: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  // URL validation
  it("accepts empty string logoUrl", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      logoUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid logoUrl", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      logoUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string websiteUrl", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      websiteUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid websiteUrl", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  // Boolean
  it("rejects non-boolean isActive", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  // Affiliate program
  it("rejects affiliateProgram exceeding 100 characters", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      affiliateProgram: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string affiliateProgram", () => {
    const result = storeFormSchema.safeParse({
      ...validStore,
      affiliateProgram: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("storeUpdateSchema (partial)", () => {
  it("accepts updating only name", () => {
    const result = storeUpdateSchema.safeParse({ name: "Best Buy" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = storeUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates slug format on partial updates", () => {
    const result = storeUpdateSchema.safeParse({ slug: "INVALID SLUG" });
    expect(result.success).toBe(false);
  });
});
