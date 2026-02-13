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

  // Format date for datetime-local input
  const formattedDeal = {
    ...deal,
    storeId: deal.store.id,
    categoryId: deal.category?.id,
    expiresAt: deal.expiresAt
      ? new Date(deal.expiresAt).toISOString().slice(0, 16)
      : "",
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
