import { describe, it, expect } from "vitest";
import {
  categoryFormSchema,
  categoryUpdateSchema,
} from "@/lib/validations/category";

const validCategory = {
  name: "Electronics",
  slug: "electronics",
};

describe("categoryFormSchema", () => {
  it("accepts valid category with required fields", () => {
    const result = categoryFormSchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it("accepts valid category with all optional fields", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      description: "Electronic devices and gadgets",
      parentId: 1,
    });
    expect(result.success).toBe(true);
  });

  // Name validation
  it("rejects empty name", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 100 characters", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  // Slug validation
  it("rejects empty slug", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      slug: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts slug with lowercase letters, numbers, and hyphens", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      slug: "home-garden-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      slug: "Electronics",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with underscores", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      slug: "home_garden",
    });
    expect(result.success).toBe(false);
  });

  // ParentId
  it("accepts null parentId", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      parentId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined parentId", () => {
    const result = categoryFormSchema.safeParse(validCategory);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentId).toBeUndefined();
    }
  });

  // Description
  it("accepts empty string description", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      description: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("categoryUpdateSchema (partial)", () => {
  it("accepts updating only name", () => {
    const result = categoryUpdateSchema.safeParse({ name: "Home & Garden" });
    expect(result.success).toBe(true);
  });

  it("accepts updating only description", () => {
    const result = categoryUpdateSchema.safeParse({
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = categoryUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates slug format on partial updates", () => {
    const result = categoryUpdateSchema.safeParse({
      slug: "BAD SLUG!",
    });
    expect(result.success).toBe(false);
  });
});
