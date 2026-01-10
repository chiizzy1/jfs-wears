"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Edit } from "lucide-react";

interface PromotionsTableProps {
  data: Promotion[];
  isLoading: boolean;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string, code: string) => void;
}

export function PromotionsTable({ data, isLoading, onEdit, onDelete }: PromotionsTableProps) {
  const columns = useMemo<ColumnDef<Promotion>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <code className="bg-secondary px-2 py-1 text-xs font-mono rounded">{row.original.code}</code>,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.type}</span>,
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.type === "PERCENTAGE" ? `${row.original.value}%` : `₦${row.original.value.toLocaleString()}`}
          </span>
        ),
      },
      {
        accessorKey: "usageCount",
        header: "Usage",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span>{row.original.usageCount || 0}</span>
            {row.original.usageLimit && <span className="text-muted-foreground">/ {row.original.usageLimit}</span>}
          </div>
        ),
      },
      {
        accessorKey: "validTo",
        header: "Expires",
        cell: ({ row }) => {
          return new Date(row.original.validTo).toLocaleDateString("en-NG", {
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
          const promo = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(promo)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(promo.id, promo.code)} className="text-red-600 focus:text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="code"
      loading={isLoading}
      meta={{
        pluralName: "Promotions",
      }}
    />
  );
}
