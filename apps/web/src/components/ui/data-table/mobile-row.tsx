import { cn } from "@/lib/utils";
import React from "react";

interface MobileRowProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

export function MobileRow({ children, className, cols = 2 }: MobileRowProps) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4 bg-gray-50/50 border-t border-gray-100",
        cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileRowItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function MobileRowItem({ label, children, className, fullWidth }: MobileRowItemProps) {
  return (
    <div className={cn("space-y-1", fullWidth && "col-span-full", className)}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">{label}</span>
      <div className="text-sm font-medium block break-words">{children}</div>
    </div>
  );
}
