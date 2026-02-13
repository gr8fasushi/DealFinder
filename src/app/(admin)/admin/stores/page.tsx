import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoresTable } from "@/components/admin/StoresTable";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

async function getStores() {
  const allStores = await db.query.stores.findMany({
    orderBy: [desc(stores.createdAt)],
  });
  return allStores;
}

export default async function StoresPage() {
  const storesData = await getStores();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600 mt-2">
            Manage stores and retailers in your platform
          </p>
        </div>
        <Link href="/admin/stores/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </Link>
      </div>

      <StoresTable stores={storesData} />
    </div>
  );
}
