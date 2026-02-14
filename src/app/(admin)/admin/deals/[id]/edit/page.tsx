import { DealForm } from "@/components/admin/DealForm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getDeal(id: string) {
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, parseInt(id)),
    with: {
      store: true,
      category: true,
    },
  });

  return deal || null;
}

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);

  if (!deal) {
    notFound();
  }

  // Format date for datetime-local input and convert nulls to undefined
  const dealData = deal as any;
  const formattedDeal = {
    ...dealData,
    storeId: dealData.store.id,
    categoryId: dealData.category?.id ?? undefined,
    expiresAt: dealData.expiresAt
      ? new Date(dealData.expiresAt).toISOString().slice(0, 16)
      : "",
    brand: dealData.brand ?? undefined,
    imageUrl: dealData.imageUrl ?? undefined,
    description: dealData.description ?? undefined,
    originalPrice: dealData.originalPrice ?? undefined,
    sku: dealData.sku ?? undefined,
    externalId: dealData.externalId ?? undefined,
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Deal</h1>
        <p className="text-gray-600 mt-2">Update deal information</p>
      </div>

      <DealForm mode="edit" initialData={formattedDeal} />
    </div>
  );
}
