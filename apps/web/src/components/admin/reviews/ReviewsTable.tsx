"use client";

import { Trash2, Star, Check, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Review } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading: boolean;
  onApprove: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function ReviewsTable({ reviews, isLoading, onApprove, onDelete }: ReviewsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Author</th>
            <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Product</th>
            <th className="px-6 py-4 text-center text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Rating</th>
            <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium max-w-xs">
              Review
            </th>
            <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Status</th>
            <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Date</th>
            <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!reviews || reviews.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                No reviews found matching your criteria.
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{review.user.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{review.user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm max-w-[200px] truncate">{review.product?.name || "—"}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {review.rating}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="space-y-1">
                    {review.title && <p className="font-medium text-sm truncate">{review.title}</p>}
                    <p className="text-sm text-gray-500 truncate" title={review.comment || ""}>
                      {review.comment || "—"}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      review.isApproved ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 ${review.isApproved ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {review.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(review.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
