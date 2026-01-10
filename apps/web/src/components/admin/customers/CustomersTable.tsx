"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";

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
        header: "Customer",
        cell: ({ row }) => <span className="font-medium">{row.original.name || "—"}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "orders",
        header: "Orders",
        cell: ({ row }) => <span>{row.original.orders?.length || 0}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
          return new Date(row.original.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(customer.id, customer.name || customer.email)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
