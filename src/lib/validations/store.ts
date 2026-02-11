import { z } from "zod";

export const storeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  logoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  affiliateProgram: z.string().max(100).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type StoreFormData = z.infer<typeof storeFormSchema>;

export const storeUpdateSchema = storeFormSchema.partial();
