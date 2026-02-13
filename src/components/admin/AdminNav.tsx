"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Tag, Store, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Deals",
    href: "/admin/deals",
    icon: Tag,
  },
  {
    name: "Stores",
    href: "/admin/stores",
    icon: Store,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-gray-900 text-white flex flex-col">
      <Link href="/" className="p-6 border-b border-gray-800 block hover:bg-gray-800 transition-colors">
        <h1 className="text-2xl font-bold">DealFinder</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
      </Link>

      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-sm">← Back to Site</span>
        </Link>
      </div>
    </nav>
  );
}
