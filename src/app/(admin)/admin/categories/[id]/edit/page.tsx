import { CategoryForm } from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getCategory(id: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, parseInt(id)),
  });

  return category || null;
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
