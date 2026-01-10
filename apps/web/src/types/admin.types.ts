/**
 * Admin Dashboard Types
 * Centralized type definitions for admin dashboard components
 */

import { Product, Order, Promotion, User, Staff, Category } from "@/lib/admin-api";

// Re-export commonly used types
export type { Product, Order, Promotion, User, Staff, Category };

/**
 * Dashboard overview statistics from API
 */
export interface DashboardOverview {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  ordersToday: number;
}

/**
 * Revenue breakdown from API
 */
export interface DashboardRevenue {
  today: number;
  thisMonth: number;
  thisYear: number;
}

/**
 * Complete dashboard data response from API
 */
export interface DashboardData {
  overview: DashboardOverview;
  revenue: DashboardRevenue;
  ordersByStatus: { status: string; count: number }[];
  topProducts: { id: string; name: string; totalSold: number }[];
}

/**
 * Low stock alert item
 */
export interface LowStockItem {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  stock: number;
}

/**
 * Recent order display type (simplified from Order)
 */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  user?: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
}

/**
 * Stats card data for dashboard
 */
export interface DashboardStat {
  label: string;
  value: string;
  subtext: string;
  change: string;
  trend: "up" | "down";
}

/**
 * Chart data point for revenue chart
 */
export interface RevenueChartData {
  month: string;
  revenue: number;
  orders: number;
}

/**
 * Chart data point for weekly orders
 */
export interface WeeklyOrdersData {
  day: string;
  orders: number;
}

/**
 * Order status type
 */
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

/**
 * Payment status type
 */
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/**
 * Status style mapping type
 */
export type StatusStyleMap = Record<string, string>;
