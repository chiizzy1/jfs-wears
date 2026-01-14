"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/admin-api";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Order</span>,
    cell: ({ row }) => (
      <span className="font-medium font-mono text-xs">{row.original.orderNumber || row.original.id.slice(0, 12)}</span>
    ),
  },
  {
    accessorKey: "user.name",
    header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Customer</span>,
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
    header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Items</span>,
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
      <div className="flex justify-end">
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
