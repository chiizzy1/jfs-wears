"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminAPI, Order } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getOrders();
      const ordersList = Array.isArray(data) ? data : (data as any).items || (data as any).orders || [];
      setOrders(ordersList);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    return statusFilter === "all" || order.status === statusFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderCounts = () => ({
    all: orders.length,
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  });

  const counts = getOrderCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Orders</h1>
          <p className="text-2xl font-light mt-1">Order Management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-3 border border-gray-200 hover:border-black transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button className="px-6 py-3 border border-gray-200 hover:border-black transition-colors text-xs uppercase tracking-[0.1em] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All Orders", count: counts.all, filter: "all" },
          { label: "Pending", count: counts.PENDING, filter: "PENDING" },
          { label: "Confirmed", count: counts.CONFIRMED, filter: "CONFIRMED" },
          { label: "Shipped", count: counts.SHIPPED, filter: "SHIPPED" },
          { label: "Delivered", count: counts.DELIVERED, filter: "DELIVERED" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setStatusFilter(stat.filter)}
            className={`p-4 text-left transition-all border ${
              statusFilter === stat.filter ? "border-black bg-black text-white" : "border-gray-100 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-light">{stat.count}</p>
            <p className="text-xs uppercase tracking-[0.1em] mt-1 opacity-70">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No orders found</h3>
            <p className="mt-2 text-sm text-muted">
              {orders.length === 0
                ? "Orders will appear here when customers make purchases."
                : "No orders match the selected filter."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Order</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Customer</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Items</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Total</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Status</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Payment</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Date</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{order.orderNumber || order.id.slice(0, 12)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-muted">{order.user?.email || "—"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{order.items?.length || 0} items</td>
                  <td className="px-6 py-4 font-medium">₦{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 text-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs uppercase tracking-[0.1em] text-muted hover:text-black transition-colors underline underline-offset-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-muted uppercase tracking-[0.1em]">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
    SHIPPED: "bg-purple-50 text-purple-700 border border-purple-200",
    DELIVERED: "bg-green-50 text-green-700 border border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    PAID: "bg-green-50 text-green-700 border border-green-200",
    FAILED: "bg-red-50 text-red-700 border border-red-200",
    REFUNDED: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
      {status}
    </span>
  );
}
