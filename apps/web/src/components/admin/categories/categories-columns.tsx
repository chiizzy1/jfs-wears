"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Category } from "@/types/category.types";
import { Button } from "@/components/ui/button";

interface CategoriesColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const getCategoriesColumns = ({ onEdit, onDelete }: CategoriesColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</span>,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "slug",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Slug</span>,
    cell: ({ row }) => <span className="text-gray-500 font-mono text-sm">{row.original.slug}</span>,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "description",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Description</span>,
    cell: ({ row }) => <span className="text-gray-500 text-sm max-w-xs truncate block">{row.original.description || "—"}</span>,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "_count.products",
    header: () => (
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Products</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={`inline-flex items-center justify-center min-w-8 px-2 py-1 text-xs font-medium rounded-none ${
            (row.original._count?.products || 0) > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
          }`}
        >
          {row.original._count?.products || 0}
        </span>
      </div>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "isActive",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center gap-1.5 text-xs ${row.original.isActive ? "text-emerald-600" : "text-gray-400"}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${row.original.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            className="h-8 w-8 text-muted-foreground hover:text-black hover:bg-gray-100"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category)}
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
