import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealsTable } from "@/components/admin/DealsTable";

async function getDeals() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/admin/deals`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch deals");
  }

  return res.json();
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-2">
            Manage all deals in your platform
          </p>
        </div>
        <Link href="/admin/deals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </Link>
      </div>

      <DealsTable deals={deals} />
    </div>
  );
}
