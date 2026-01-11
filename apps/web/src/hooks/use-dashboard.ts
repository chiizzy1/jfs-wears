"use client";

import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "@/lib/admin-api";
import { toast } from "react-hot-toast";
import { DashboardData, LowStockItem, RecentOrder, DashboardStat } from "@/types/admin.types";
import { formatCurrency } from "@/lib/format";

interface RevenueChartData {
  month: string;
  revenue: number;
}

interface WeeklyOrdersData {
  day: string;
  orders: number;
}

interface UseDashboardReturn {
  dashboard: DashboardData | null;
  lowStock: LowStockItem[];
  recentOrders: RecentOrder[];
  revenueData: RevenueChartData[];
  weeklyOrdersData: WeeklyOrdersData[];
  stats: DashboardStat[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for dashboard data fetching & state management
 * Encapsulates all dashboard API calls and data transformations
 */
export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [weeklyOrdersData, setWeeklyOrdersData] = useState<WeeklyOrdersData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashboardData, lowStockData, ordersData, revenueByPeriod, weeklyOrders] = await Promise.all([
        adminAPI.getDashboard().catch(() => null),
        adminAPI.getLowStock(10).catch(() => []),
        adminAPI.getOrders({ limit: 5 }).catch(() => []),
        adminAPI.getRevenueByPeriod("month").catch(() => []),
        adminAPI.getOrdersByPeriod("week").catch(() => []),
      ]);

      if (dashboardData) {
        setDashboard(dashboardData);
      }
      setLowStock(lowStockData || []);

      // Handle orders response (could be array or paginated)
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any).items || (ordersData as any).orders || [];
      setRecentOrders(orders.slice(0, 5));

      // Transform revenue data for chart (date to month abbreviation)
      const transformedRevenue = (revenueByPeriod || []).map((item) => {
        const date = new Date(item.date + "-01"); // Add day for parsing
        const month = date.toLocaleDateString("en-US", { month: "short" });
        return { month, revenue: item.revenue };
      });
      setRevenueData(transformedRevenue);

      setWeeklyOrdersData(weeklyOrders || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch dashboard data");
      setError(error);
      console.error("[useDashboard] Error:", error);
      // Only show toast on manual refresh, not initial load
      if (showToast) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute stats from dashboard data
  const stats: DashboardStat[] = dashboard
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(dashboard.revenue.thisMonth || 0),
          subtext: "This month",
          change: "+12%", // TODO: Calculate from real data comparison
          trend: "up",
        },
        {
          label: "Orders",
          value: dashboard.overview.totalOrders?.toString() || "0",
          subtext: `${dashboard.overview.ordersToday || 0} today`,
          change: "+8%",
          trend: "up",
        },
        {
          label: "Products",
          value: dashboard.overview.totalProducts?.toString() || "0",
          subtext: "Active products",
          change: "+5%",
          trend: "up",
        },
        {
          label: "Customers",
          value: dashboard.overview.totalUsers?.toString() || "0",
          subtext: "Registered users",
          change: "+15%",
          trend: "up",
        },
      ]
    : [];

  return {
    dashboard,
    lowStock,
    recentOrders,
    revenueData,
    weeklyOrdersData,
    stats,
    isLoading,
    error,
    refetch: () => fetchDashboardData(true),
  };
}
