import { StoreForm } from "@/components/admin/StoreForm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getStore(id: string) {
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, parseInt(id)),
  });

  return store || null;
}

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore(id);

  if (!store) {
    notFound();
  }

  // Convert nulls to undefined for form compatibility
  const formattedStore = {
    ...store,
    logoUrl: store.logoUrl ?? undefined,
    websiteUrl: store.websiteUrl ?? undefined,
    affiliateProgram: store.affiliateProgram ?? undefined,
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Store</h1>
        <p className="text-gray-600 mt-2">Update store information</p>
      </div>

      <StoreForm mode="edit" initialData={formattedStore} />
    </div>
  );
}
