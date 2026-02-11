"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Store, FolderTree, CheckCircle } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalDeals: number;
    activeDeals: number;
    totalStores: number;
    activeStores: number;
    totalCategories: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Deals",
      value: stats.totalDeals,
      subtitle: `${stats.activeDeals} active`,
      icon: Tag,
      color: "text-blue-600",
    },
    {
      title: "Total Stores",
      value: stats.totalStores,
      subtitle: `${stats.activeStores} active`,
      icon: Store,
      color: "text-green-600",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      subtitle: "All categories",
      icon: FolderTree,
      color: "text-purple-600",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals,
      subtitle: `${Math.round((stats.activeDeals / stats.totalDeals) * 100) || 0}% of total`,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
