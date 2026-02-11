import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().optional().or(z.literal("")),
  parentId: z.number().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const categoryUpdateSchema = categoryFormSchema.partial();
