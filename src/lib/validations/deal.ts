import { z } from "zod";

export const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  storeId: z.number({ required_error: "Store is required" }),
  categoryId: z.number().optional().nullable(),
  currentPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (use 0.00)"),
  originalPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (use 0.00)")
    .optional()
    .or(z.literal("")),
  productUrl: z.string().url("Must be a valid URL"),
  affiliateUrl: z.string().url("Must be a valid URL"),
  brand: z.string().max(255).optional().or(z.literal("")),
  sku: z.string().max(255).optional().or(z.literal("")),
  externalId: z.string().max(255).optional().or(z.literal("")),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  expiresAt: z.string().optional().or(z.literal("")), // ISO date string
});

export type DealFormData = z.infer<typeof dealFormSchema>;

export const dealUpdateSchema = dealFormSchema.partial();
