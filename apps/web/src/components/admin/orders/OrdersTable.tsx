"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => <span className="font-medium">{row.original.orderNumber || row.original.id.slice(0, 12)}</span>,
    },
    {
      accessorKey: "user.name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.user?.name || "Guest"}</p>
          <p className="text-xs text-muted-foreground">{row.original.user?.email || "—"}</p>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.items?.length || 0,
      header: "Items",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.items?.length || 0} items</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-medium">₦{row.original.total.toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <PaymentBadge status={row.original.paymentStatus} />,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild className="h-8 text-xs uppercase tracking-wider">
            <Link href={`/admin/orders/${row.original.id}`}>View</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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
            className={`p-4 text-left transition-all border rounded-lg ${
              statusFilter === stat.filter ? "border-black bg-black text-white" : "border-gray-100 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-light">{stat.count}</p>
            <p className="text-xs uppercase tracking-widest mt-1 opacity-70">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center border rounded-lg bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredOrders} />
      )}
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
    <span
      className={`px-2 py-1 text-xs font-medium border rounded-full ${
        styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium border rounded-full ${
        styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}
