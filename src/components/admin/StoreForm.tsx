"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeFormSchema, type StoreFormData } from "@/lib/validations/store";
import { generateSlug } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreFormProps {
  initialData?: Partial<StoreFormData> & { id?: number };
  mode: "create" | "edit";
}

export function StoreForm({ initialData, mode }: StoreFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      logoUrl: initialData?.logoUrl || "",
      websiteUrl: initialData?.websiteUrl || "",
      affiliateProgram: initialData?.affiliateProgram || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const name = watch("name");
  const slug = watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug && mode === "create") {
      setValue("slug", generateSlug(name));
    }
  }, [name, slug, setValue, mode]);

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const url =
        mode === "create"
          ? "/api/admin/stores"
          : `/api/admin/stores/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let message = "Failed to save store";
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          // Response was not JSON
        }
        throw new Error(message);
      }

      setSuccess(true);

      if (mode === "create") {
        router.push("/admin/stores");
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create New Store" : "Edit Store"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Store {mode === "create" ? "created" : "updated"} successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Store Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Amazon"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="e.g., amazon"
            />
            <p className="text-sm text-gray-500">
              Used in URLs. Auto-generated from name, but you can customize it.
            </p>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              {...register("logoUrl")}
              placeholder="https://example.com/logo.png"
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              {...register("websiteUrl")}
              placeholder="https://www.example.com"
            />
            {errors.websiteUrl && (
              <p className="text-sm text-red-500">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateProgram">Affiliate Program</Label>
            <Input
              id="affiliateProgram"
              {...register("affiliateProgram")}
              placeholder="e.g., Amazon Associates"
            />
            {errors.affiliateProgram && (
              <p className="text-sm text-red-500">
                {errors.affiliateProgram.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) =>
                setValue("isActive", checked as boolean)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Store"
                : "Update Store"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/stores")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
