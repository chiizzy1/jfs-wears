import { User } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface CustomerMobileRowProps {
  customer: User;
  className?: string;
}

export function CustomerMobileRow({ customer, className }: CustomerMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Email">
        <span className="break-all">{customer.email}</span>
      </MobileRowItem>

      <MobileRowItem label="Joined">{formatDate(customer.createdAt)}</MobileRowItem>
    </MobileRow>
  );
}
