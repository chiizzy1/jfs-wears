import { Staff } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface StaffMobileRowProps {
  staff: Staff;
  className?: string;
}

export function StaffMobileRow({ staff, className }: StaffMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Email" fullWidth>
        <span className="break-all">{staff.email}</span>
      </MobileRowItem>

      <MobileRowItem label="Role">
        <span className="text-xs uppercase tracking-wider font-medium inline-block px-2 py-0.5 rounded-none bg-gray-100 text-gray-700">
          {staff.role}
        </span>
      </MobileRowItem>

      <MobileRowItem label="Status">
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", staff.isActive ? "bg-green-500" : "bg-red-500")} />
          <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
            {staff.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </MobileRowItem>
    </MobileRow>
  );
}
