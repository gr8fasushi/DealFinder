"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Deal {
  id: number;
  title: string;
  currentPrice: string;
  originalPrice: string | null;
  savingsPercent: string | null;
  isActive: boolean;
  isFeatured: boolean;
  store: { name: string };
  category: { name: string } | null;
}

interface DealsTableProps {
  deals: Deal[];
}

export function DealsTable({ deals: initialDeals }: DealsTableProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/deals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deal");
      }

      setDeals(deals.map((d) => (d.id === id ? { ...d, isActive: false } : d)));
    } catch {
      alert("Failed to delete deal");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDeals = deals.filter(
    (deal) =>
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      deal.store.name.toLowerCase().includes(search.toLowerCase()) ||
      deal.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {filteredDeals.length} of {deals.length} deals
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {search
              ? "No deals found matching your search."
              : 'No deals found. Click "Add Deal" to create your first deal.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="flex items-center gap-2">
                      {deal.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <span className="truncate">{deal.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{deal.store.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {deal.category ? (
                      <Badge variant="secondary">{deal.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">
                        ${parseFloat(deal.currentPrice).toFixed(2)}
                      </div>
                      {deal.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          ${parseFloat(deal.originalPrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {deal.savingsPercent ? (
                      <Badge className="bg-green-600">
                        {parseFloat(deal.savingsPercent).toFixed(0)}% off
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={deal.isActive ? "default" : "secondary"}>
                      {deal.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/deals/${deal.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(deal.id, deal.title)}
                      disabled={deletingId === deal.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
