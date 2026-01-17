"use client";

import { useMemo, useState } from "react";
import { Review } from "@/hooks/use-reviews";
import { TableSkeleton } from "@/components/admin/skeletons/TableSkeleton";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { getReviewsColumns } from "./reviews-columns";
import { ReviewMobileRow } from "./ReviewMobileRow";
import { ReviewResponseDialog } from "./ReviewResponseDialog";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading: boolean;
  onApprove: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function ReviewsTable({ reviews, isLoading, onApprove, onDelete }: ReviewsTableProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAIReply = (review: Review) => {
    setSelectedReview(review);
    setDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      getReviewsColumns({
        onApprove,
        onDelete,
        onAIReply: handleAIReply,
      }),
    [onApprove, onDelete],
  );

  if (isLoading) {
    return <TableSkeleton columns={7} rows={10} />;
  }

  return (
    <>
      <div className="rounded-none border-t border-gray-100">
        <DataTable
          columns={columns}
          data={reviews}
          meta={{
            pluralName: "Reviews",
          }}
          renderSubComponent={(props) => <ReviewMobileRow review={props.row.original} />}
        />
      </div>
      <ReviewResponseDialog review={selectedReview} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
