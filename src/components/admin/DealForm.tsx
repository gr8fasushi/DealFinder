"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealFormSchema, type DealFormData } from "@/lib/validations/deal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealFormProps {
  initialData?: Partial<DealFormData> & { id?: number };
  mode: "create" | "edit";
}

interface Store {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export function DealForm({ initialData, mode }: DealFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      storeId: initialData?.storeId || 0,
      categoryId: initialData?.categoryId || null,
      currentPrice: initialData?.currentPrice || "",
      originalPrice: initialData?.originalPrice || "",
      productUrl: initialData?.productUrl || "",
      affiliateUrl: initialData?.affiliateUrl || "",
      brand: initialData?.brand || "",
      sku: initialData?.sku || "",
      externalId: initialData?.externalId || "",
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      expiresAt: initialData?.expiresAt || "",
    },
  });

  // Fetch stores and categories
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stores").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([storesData, categoriesData]) => {
        setStores(storesData);
        setCategories(categoriesData);
      })
      .catch((err) => console.error("Failed to fetch data:", err));
  }, []);

  const onSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const url =
        mode === "create"
          ? "/api/admin/deals"
          : `/api/admin/deals/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save deal");
      }

      setSuccess(true);

      if (mode === "create") {
        router.push("/admin/deals");
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
            {mode === "create" ? "Create New Deal" : "Edit Deal"}
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
              Deal {mode === "create" ? "created" : "updated"} successfully!
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., AirPods Pro 2nd Generation"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed description of the deal..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                {...register("imageUrl")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Store and Category */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Store & Category</h3>

            <div className="space-y-2">
              <Label htmlFor="storeId">
                Store <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("storeId")?.toString()}
                onValueChange={(value) => setValue("storeId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.storeId && (
                <p className="text-sm text-red-500">
                  {errors.storeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={watch("categoryId")?.toString() || "none"}
                onValueChange={(value) =>
                  setValue(
                    "categoryId",
                    value === "none" ? null : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPrice">
                  Current Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentPrice"
                  {...register("currentPrice")}
                  placeholder="99.99"
                  type="text"
                />
                {errors.currentPrice && (
                  <p className="text-sm text-red-500">
                    {errors.currentPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  {...register("originalPrice")}
                  placeholder="149.99"
                  type="text"
                />
                <p className="text-xs text-gray-500">
                  Savings calculated automatically
                </p>
                {errors.originalPrice && (
                  <p className="text-sm text-red-500">
                    {errors.originalPrice.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>

            <div className="space-y-2">
              <Label htmlFor="productUrl">
                Product URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productUrl"
                {...register("productUrl")}
                placeholder="https://store.com/product"
              />
              {errors.productUrl && (
                <p className="text-sm text-red-500">
                  {errors.productUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">
                Affiliate URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="affiliateUrl"
                {...register("affiliateUrl")}
                placeholder="https://affiliate.com/link"
              />
              {errors.affiliateUrl && (
                <p className="text-sm text-red-500">
                  {errors.affiliateUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  {...register("brand")}
                  placeholder="e.g., Apple"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} placeholder="SKU-12345" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalId">External ID</Label>
                <Input
                  id="externalId"
                  {...register("externalId")}
                  placeholder="EXT-ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                {...register("expiresAt")}
                type="datetime-local"
              />
              <p className="text-xs text-gray-500">
                Optional expiration date for this deal
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked as boolean)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible on site)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", checked as boolean)
                  }
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Deal"
                : "Update Deal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/deals")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
