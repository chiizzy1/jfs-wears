"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/use-dashboard";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ChartPeriod } from "@/constants/dashboard.constants";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Admin Dashboard View Component
 * Displays overview stats, revenue charts, recent orders, top products, and low stock alerts
 * All data is fetched from real API endpoints via useDashboard hook
 */
export function DashboardView() {
  const { dashboard, lowStock, recentOrders, revenueData, weeklyOrdersData, stats, isLoading } = useDashboard();

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("year");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-gray-100 hover:border-gray-200 transition-colors">
            <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium mb-3">{stat.label}</p>
            <p className="text-3xl font-light tracking-tight">{stat.value}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-muted">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart with Recharts */}
      <div className="bg-white p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium">Revenue Overview</h2>
            <p className="text-muted text-sm mt-1">
              {revenueData.length > 0 ? "Revenue from confirmed orders" : "No revenue data available"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod("year")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                chartPeriod === "year" ? "bg-black text-white" : "border border-gray-200 hover:border-black"
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setChartPeriod("month")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                chartPeriod === "month" ? "bg-black text-white" : "border border-gray-200 hover:border-black"
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="h-72">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1c1c" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1c1c1c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value), false), "Revenue"]}
                  contentStyle={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 0,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1c1c1c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted">No revenue data to display</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-white p-6 border border-gray-100">
          <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-6">Orders This Week</h2>
          <div className="h-48">
            {weeklyOrdersData.some((d) => d.orders > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOrdersData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" fill="#1c1c1c" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">No orders this week</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-4"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-muted text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {/* Header - hidden on mobile */}
                <div className="hidden sm:grid sm:grid-cols-4 gap-4 pb-3 border-b border-gray-100">
                  <span className="text-xs uppercase tracking-widest text-muted font-medium">Order</span>
                  <span className="text-xs uppercase tracking-widest text-muted font-medium">Customer</span>
                  <span className="text-xs uppercase tracking-widest text-muted font-medium">Amount</span>
                  <span className="text-xs uppercase tracking-widest text-muted font-medium">Status</span>
                </div>
                {/* Order items */}
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-muted sm:hidden">Order:</span>
                      <span className="font-medium text-sm">{order.orderNumber || order.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-muted sm:hidden">Customer:</span>
                      <span className="text-sm text-muted">{order.user?.name || "Guest"}</span>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-muted sm:hidden">Amount:</span>
                      <span className="text-sm font-medium">{formatCurrency(order.total, false)}</span>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-muted sm:hidden">Status:</span>
                      <StatusBadge status={order.status} variant="badge" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium">Top Products</h2>
            <Link
              href="/admin/products"
              className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-4"
            >
              View All
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {dashboard?.topProducts && dashboard.topProducts.length > 0 ? (
              dashboard.topProducts.slice(0, 5).map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted">{product.totalSold} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-8">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xs uppercase tracking-[0.15em] font-medium">Low Stock Alert</h2>
              {lowStock.length > 0 && <span className="bg-black text-white text-xs px-2 py-1">{lowStock.length}</span>}
            </div>
            <Link
              href="/admin/products?filter=low-stock"
              className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-4"
            >
              Manage
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((item) => (
                <div key={item.variantId} className="flex items-center justify-between p-3 bg-secondary">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted">{item.sku}</p>
                  </div>
                  <span className="text-red-600 font-medium text-sm shrink-0">{item.stock} left</span>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-8">All products in stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
