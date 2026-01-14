"use client";

import { useState } from "react";
import { useAdminReviews, useReviewAction } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import { ReviewsFilters } from "@/components/admin/reviews/ReviewsFilters";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and moderate customer reviews</p>
        </div>
      </div>

      {/* Filters */}
      <ReviewsFilters search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />

      {/* Reviews Table */}
      <ReviewsTable
        reviews={data?.reviews || []}
        isLoading={isLoading}
        onApprove={handleApprove}
        onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
      />

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
