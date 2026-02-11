import { StoreForm } from "@/components/admin/StoreForm";
import { notFound } from "next/navigation";

async function getStore(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/admin/stores/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
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

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Store</h1>
        <p className="text-gray-600 mt-2">Update store information</p>
      </div>

      <StoreForm mode="edit" initialData={store} />
    </div>
  );
}
