"use client";

import { useState } from "react";
import { useAdminReviews, useReviewAction } from "@/hooks/use-reviews";
import { Trash2, Pencil, Loader2, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const { data, isLoading } = useAdminReviews({
    page,
    limit: 10,
    search,
    status,
  });

  const { mutate: performAction } = useReviewAction();

  const handleApprove = (id: string, currentStatus: boolean) => {
    performAction({ id, action: "approve", value: !currentStatus });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      performAction({ id: deleteConfirm.id, action: "delete" });
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and moderate customer reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by author, product, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Author
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Product
              </th>
              <th className="px-6 py-4 text-center text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium max-w-xs">
                Review
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Date
              </th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!data?.reviews || data.reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No reviews found matching your criteria.
                </td>
              </tr>
            ) : (
              data.reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{review.user.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{review.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm max-w-[200px] truncate">
                    {review.product?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {review.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="space-y-1">
                      {review.title && <p className="font-medium text-sm truncate">{review.title}</p>}
                      <p className="text-sm text-muted-foreground truncate" title={review.comment || ""}>
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
                  <td className="px-6 py-4 text-muted-foreground text-sm">{formatDate(review.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(review.id, review.isApproved)}
                        className={`p-2 transition-colors ${
                          review.isApproved ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"
                        }`}
                        title={review.isApproved ? "Unapprove" : "Approve"}
                      >
                        {review.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: review.id })}
                        className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.lastPage > 1 && (
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.meta.lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.meta.lastPage, p + 1))}
            disabled={page === data.meta.lastPage}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}
