"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export function OrdersTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { orders, isLoading } = useOrders({ status: "all" });

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => statusFilter === "all" || order.status === statusFilter)
    : [];

  const getOrderCounts = () => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return {
      all: safeOrders.length,
      PENDING: safeOrders.filter((o) => o.status === "PENDING").length,
      CONFIRMED: safeOrders.filter((o) => o.status === "CONFIRMED").length,
      SHIPPED: safeOrders.filter((o) => o.status === "SHIPPED").length,
      DELIVERED: safeOrders.filter((o) => o.status === "DELIVERED").length,
    };
  };

  const counts = getOrderCounts();

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Order</span>,
      cell: ({ row }) => (
        <span className="font-medium font-mono text-xs">{row.original.orderNumber || row.original.id.slice(0, 12)}</span>
      ),
    },
    {
      accessorKey: "user.name",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Customer</span>,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-primary uppercase tracking-wide">{row.original.user?.name || "Guest"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{row.original.user?.email || "—"}</p>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.items?.length || 0,
      id: "itemsCount",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Items</span>,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-muted-foreground tabular-nums">{row.original.items?.length || 0}</span>
      ),
    },
    {
      accessorKey: "total",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Total</span>,
      cell: ({ row }) => <span className="font-medium text-sm tabular-nums">₦{row.original.total.toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
      cell: ({ row }) => <StatusBadge status={row.original.status} type="order" />,
    },
    {
      accessorKey: "paymentStatus",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Payment</span>,
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} type="payment" />,
    },
    {
      accessorKey: "createdAt",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Date</span>,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            href={`/admin/orders/${row.original.id}`}
            className="text-xs uppercase tracking-widest hover:text-black hover:underline underline-offset-4"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Filters Toolbar - Minimalist */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end border-b border-gray-100 pb-6">
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {[
            { label: "All", count: counts.all, filter: "all" },
            { label: "Pending", count: counts.PENDING, filter: "PENDING" },
            { label: "Confirmed", count: counts.CONFIRMED, filter: "CONFIRMED" },
            { label: "Shipped", count: counts.SHIPPED, filter: "SHIPPED" },
            { label: "Delivered", count: counts.DELIVERED, filter: "DELIVERED" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.filter)}
              className={`pb-1 text-xs uppercase tracking-widest transition-colors ${
                statusFilter === stat.filter
                  ? "border-b-2 border-black text-black font-medium"
                  : "text-muted-foreground hover:text-black border-b-2 border-transparent"
              }`}
            >
              {stat.label}{" "}
              <span className="text-[10px] bg-gray-100 px-1 py-0.5 rounded-sm ml-1 text-gray-500 tabular-nums">{stat.count}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <Button variant="premium" size="sm" className="h-9 px-6 text-[10px]">
          Export CSV
        </Button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="rounded-none border-t border-gray-100">
          <DataTable columns={columns} data={filteredOrders} />
        </div>
      )}
    </div>
  );
}
