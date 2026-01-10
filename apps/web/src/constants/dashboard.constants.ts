/**
 * Dashboard Constants
 * Style mappings and configuration for admin dashboard
 *
 * NOTE: Chart data is fetched from the API - no mock data here
 */

import { StatusStyleMap } from "@/types/admin.types";

/**
 * Order status badge styles (dot color)
 */
export const ORDER_STATUS_STYLES: StatusStyleMap = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

/**
 * Order status badge styles (full badge)
 */
export const ORDER_STATUS_BADGE_STYLES: StatusStyleMap = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

/**
 * Payment status badge styles (dot color)
 */
export const PAYMENT_STATUS_STYLES: StatusStyleMap = {
  PENDING: "bg-amber-500",
  PAID: "bg-green-500",
  FAILED: "bg-red-500",
  REFUNDED: "bg-gray-500",
};

/**
 * Default fallback style for unknown statuses
 */
export const DEFAULT_STATUS_STYLE = "bg-gray-500";
export const DEFAULT_BADGE_STYLE = "bg-gray-50 text-gray-700 border-gray-200";

/**
 * Chart period options
 */
export const CHART_PERIODS = ["year", "month"] as const;
export type ChartPeriod = (typeof CHART_PERIODS)[number];
