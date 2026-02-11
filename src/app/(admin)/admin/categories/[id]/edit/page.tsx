import { CategoryForm } from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";

async function getCategory(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/admin/categories/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-2">Update category information</p>
      </div>

      <CategoryForm mode="edit" initialData={category} />
    </div>
  );
}
