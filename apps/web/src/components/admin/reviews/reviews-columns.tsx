"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, X, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Review } from "@/hooks/use-reviews";
import { formatDate } from "@/lib/utils";

interface ReviewsColumnsProps {
  onApprove: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const getReviewsColumns = ({ onApprove, onDelete }: ReviewsColumnsProps): ColumnDef<Review>[] => [
  {
    accessorKey: "user.name",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Author</span>,
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.user.name || "Anonymous"}</p>
        <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "product.name",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Product</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm max-w-[200px] truncate block">{row.original.product?.name || "—"}</span>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "rating",
    header: () => (
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Rating</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          {row.original.rating}
        </span>
      </div>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "comment",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Review</span>,
    cell: ({ row }) => (
      <div className="max-w-xs space-y-1">
        {row.original.title && <p className="font-medium text-sm truncate">{row.original.title}</p>}
        <p className="text-sm text-muted-foreground truncate" title={row.original.comment || ""}>
          {row.original.comment || "—"}
        </p>
      </div>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "isApproved",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center gap-1.5 text-xs ${row.original.isApproved ? "text-emerald-600" : "text-amber-600"}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${row.original.isApproved ? "bg-emerald-500" : "bg-amber-500"}`} />
        {row.original.isApproved ? "Approved" : "Pending"}
      </span>
    ),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Date</span>,
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>,
    meta: { className: "hidden md:table-cell" },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const review = row.original;
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onApprove(review.id, review.isApproved)}
            className={`h-8 w-8 transition-colors ${
              review.isApproved
                ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={review.isApproved ? "Unapprove" : "Approve"}
          >
            {review.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(review.id)}
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
