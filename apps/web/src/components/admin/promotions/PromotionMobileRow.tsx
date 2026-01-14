import { Promotion } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface PromotionMobileRowProps {
  promotion: Promotion;
  className?: string;
}

export function PromotionMobileRow({ promotion, className }: PromotionMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Type">
        <span className="text-xs uppercase">{promotion.type}</span>
      </MobileRowItem>

      <MobileRowItem label="Value">
        <span className="tabular-nums">
          {promotion.type === "PERCENTAGE" ? `${promotion.value}%` : `₦${promotion.value.toLocaleString()}`}
        </span>
      </MobileRowItem>

      <MobileRowItem label="Usage">
        <div className="flex items-center gap-1 tabular-nums">
          <span>{promotion.usageCount || 0}</span>
          {promotion.usageLimit && <span className="text-muted-foreground">/ {promotion.usageLimit}</span>}
        </div>
      </MobileRowItem>

      <MobileRowItem label="Expires">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(promotion.validTo)}</span>
      </MobileRowItem>

      <MobileRowItem label="Status" className="col-span-full">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${promotion.isActive ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
            {promotion.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </MobileRowItem>
    </MobileRow>
  );
}
