import { Review } from "@/hooks/use-reviews";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

interface ReviewMobileRowProps {
  review: Review;
  className?: string;
}

export function ReviewMobileRow({ review, className }: ReviewMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Product">
        <span className="wrap-break-word">{review.product?.name || "—"}</span>
      </MobileRowItem>

      <MobileRowItem label="Rating">
        <span className="inline-flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          {review.rating}
        </span>
      </MobileRowItem>

      <MobileRowItem label="Status">
        <span className={`inline-flex items-center gap-1.5 text-xs ${review.isApproved ? "text-emerald-600" : "text-amber-600"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${review.isApproved ? "bg-emerald-500" : "bg-amber-500"}`} />
          {review.isApproved ? "Approved" : "Pending"}
        </span>
      </MobileRowItem>

      <MobileRowItem label="Date">{formatDate(review.createdAt)}</MobileRowItem>

      <MobileRowItem label="Review" fullWidth>
        <div className="space-y-1">
          {review.title && <p className="font-medium text-sm">{review.title}</p>}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.comment || "—"}</p>
        </div>
      </MobileRowItem>
    </MobileRow>
  );
}
