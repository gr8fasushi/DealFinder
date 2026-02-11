"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
}

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({
  categories: initialCategories,
}: CategoriesTableProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories(categories.filter((category) => category.id !== id));
    } catch {
      alert("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  // Find parent category name
  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name;
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">
          No categories found. Click &quot;Add Category&quot; to create your first
          category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const parentName = getParentName(category.parentId);
            return (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell>
                  {category.description ? (
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {parentName ? (
                    <Badge variant="outline">{parentName}</Badge>
                  ) : (
                    <Badge>Top-level</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deletingId === category.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
