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
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Code</span>,
        cell: ({ row }) => <code className="text-xs font-mono uppercase tracking-wider">{row.original.code}</code>,
      },
      {
        accessorKey: "name",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</span>,
        cell: ({ row }) => <span className="font-medium text-sm text-primary uppercase tracking-wide">{row.original.name}</span>,
      },
      {
        accessorKey: "type",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Type</span>,
        cell: ({ row }) => <span className="text-xs text-muted-foreground uppercase">{row.original.type}</span>,
      },
      {
        accessorKey: "value",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Value</span>,
        cell: ({ row }) => (
          <span className="font-medium text-sm tabular-nums">
            {row.original.type === "PERCENTAGE" ? `${row.original.value}%` : `₦${row.original.value.toLocaleString()}`}
          </span>
        ),
      },
      {
        accessorKey: "usageCount",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Usage</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm tabular-nums">
            <span>{row.original.usageCount || 0}</span>
            {row.original.usageLimit && <span className="text-muted-foreground">/ {row.original.usageLimit}</span>}
          </div>
        ),
      },
      {
        accessorKey: "validTo",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Expires</span>,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {new Date(row.original.validTo).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
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
          const promo = row.original;
          return (
            <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-black hover:bg-transparent hover:underline underline-offset-4"
                onClick={() => onEdit(promo)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-red-600 hover:bg-transparent text-gray-400"
                onClick={() => onDelete(promo.id, promo.code)}
              >
                Delete
              </Button>
            </div>
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
