import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoresTable } from "@/components/admin/StoresTable";

async function getStores() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/admin/stores`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stores");
  }

  return res.json();
}

export default async function StoresPage() {
  const stores = await getStores();

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

      <StoresTable stores={stores} />
    </div>
  );
}
