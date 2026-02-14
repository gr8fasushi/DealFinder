import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

async function getCategories() {
  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
  });
  return allCategories;
}

export default async function CategoriesPage() {
  const categoriesData = await getCategories();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">
            Organize deals by creating and managing categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <CategoriesTable categories={categoriesData as any} />
    </div>
  );
}
