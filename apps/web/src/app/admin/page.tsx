"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminAPI } from "@/lib/admin-api";
import { toast } from "react-hot-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardData {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    ordersToday: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  ordersByStatus: { status: string; count: number }[];
  topProducts: { id: string; name: string; totalSold: number }[];
}

interface LowStockItem {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  stock: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  user?: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
}

// Mock data for charts (in production, fetch from API)
const monthlyRevenueData = [
  { month: "Jan", revenue: 420000, orders: 45 },
  { month: "Feb", revenue: 380000, orders: 38 },
  { month: "Mar", revenue: 510000, orders: 52 },
  { month: "Apr", revenue: 620000, orders: 61 },
  { month: "May", revenue: 580000, orders: 55 },
  { month: "Jun", revenue: 720000, orders: 68 },
  { month: "Jul", revenue: 850000, orders: 82 },
  { month: "Aug", revenue: 780000, orders: 75 },
  { month: "Sep", revenue: 650000, orders: 63 },
  { month: "Oct", revenue: 890000, orders: 88 },
  { month: "Nov", revenue: 950000, orders: 95 },
  { month: "Dec", revenue: 1100000, orders: 110 },
];

const weeklyOrdersData = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 19 },
  { day: "Wed", orders: 15 },
  { day: "Thu", orders: 22 },
  { day: "Fri", orders: 28 },
  { day: "Sat", orders: 35 },
  { day: "Sun", orders: 18 },
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<"year" | "month">("year");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardData, lowStockData, ordersData] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getLowStock(10),
        adminAPI.getOrders({ limit: 5 }),
      ]);

      setDashboard(dashboardData);
      setLowStock(lowStockData);
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any).items || (ordersData as any).orders || [];
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboard?.revenue.thisMonth || 0),
      subtext: "This month",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Orders",
      value: dashboard?.overview.totalOrders?.toString() || "0",
      subtext: `${dashboard?.overview.ordersToday || 0} today`,
      change: "+8%",
      trend: "up",
    },
    {
      label: "Products",
      value: dashboard?.overview.totalProducts?.toString() || "0",
      subtext: "Active products",
      change: "+5%",
      trend: "up",
    },
    {
      label: "Customers",
      value: dashboard?.overview.totalUsers?.toString() || "0",
      subtext: "Registered users",
      change: "+15%",
      trend: "up",
    },
  ];

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
            <p className="text-muted text-sm mt-1">Monthly revenue and order trends</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod("year")}
              className={`px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
                chartPeriod === "year" ? "bg-black text-white" : "border border-gray-200 hover:border-black"
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setChartPeriod("month")}
              className={`px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
                chartPeriod === "month" ? "bg-black text-white" : "border border-gray-200 hover:border-black"
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c1c1c" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1c1c1c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                contentStyle={{ border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 12 }}
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-white p-6 border border-gray-100">
          <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-6">Orders This Week</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOrdersData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="orders" fill="#1c1c1c" />
              </BarChart>
            </ResponsiveContainer>
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
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.1em] text-muted">
                    <th className="pb-4 font-medium">Order</th>
                    <th className="pb-4 font-medium">Customer</th>
                    <th className="pb-4 font-medium">Amount</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-50">
                      <td className="py-3 font-medium">{order.orderNumber || order.id.slice(0, 8)}</td>
                      <td className="py-3 text-muted">{order.user?.name || "Guest"}</td>
                      <td className="py-3">₦{order.total.toLocaleString()}</td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2 py-1 border text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}
