"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

interface CustomersTableProps {
  data: User[];
  isLoading: boolean;
  onDelete: (id: string, name: string) => void;
}

export function CustomersTable({ data, isLoading, onDelete }: CustomersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Customer</span>,
        cell: ({ row }) => (
          <span className="font-medium text-sm text-primary uppercase tracking-wide">{row.original.name || "—"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email</span>,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "orders",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Orders</span>,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-muted-foreground tabular-nums">{row.original.orders?.length || 0}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Joined</span>,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${row.original.isActive ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
              {row.original.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-black hover:bg-transparent hover:underline underline-offset-4"
                onClick={() => alert(`View ${customer.name || customer.email} - Feature coming soon`)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-red-600 hover:bg-transparent text-gray-400"
                onClick={() => onDelete(customer.id, customer.name || customer.email)}
              >
                Deactivate
              </Button>
            </div>
          );
        },
      },
    ],
    [onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="email"
      loading={isLoading}
      meta={{
        pluralName: "Customers",
      }}
    />
  );
}
