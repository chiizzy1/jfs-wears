import { Order } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface OrderMobileRowProps {
  order: Order;
  className?: string;
}

export function OrderMobileRow({ order, className }: OrderMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Customer" fullWidth>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{order.user?.name || "Guest"}</span>
          <span className="text-xs text-muted-foreground">{order.user?.email || "—"}</span>
        </div>
      </MobileRowItem>

      <MobileRowItem label="Items">
        <span className="tabular-nums">{order.items?.length || 0}</span>
      </MobileRowItem>

      <MobileRowItem label="Date">{formatDate(order.createdAt)}</MobileRowItem>

      <MobileRowItem label="Payment">
        <StatusBadge status={order.paymentStatus} type="payment" />
      </MobileRowItem>

      <MobileRowItem label="Order Status">
        <StatusBadge status={order.status} type="order" />
      </MobileRowItem>
    </MobileRow>
  );
}
