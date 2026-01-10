"use client";

import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_STYLES,
  ORDER_STATUS_BADGE_STYLES,
  PAYMENT_STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  DEFAULT_BADGE_STYLE,
} from "@/constants/dashboard.constants";

interface StatusBadgeProps {
  status: string;
  variant?: "dot" | "badge";
  type?: "order" | "payment";
  className?: string;
}

/**
 * Reusable status badge component with dot indicator
 * Supports order status and payment status variants
 */
export function StatusBadge({ status, variant = "dot", type = "order", className }: StatusBadgeProps) {
  const dotStyles = type === "order" ? ORDER_STATUS_STYLES : PAYMENT_STATUS_STYLES;
  const badgeStyles = ORDER_STATUS_BADGE_STYLES;

  if (variant === "badge") {
    return (
      <span className={cn("px-2 py-1 border text-xs font-medium", badgeStyles[status] || DEFAULT_BADGE_STYLE, className)}>
        {status}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", dotStyles[status] || DEFAULT_STATUS_STYLE)} />
      <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{status}</span>
    </div>
  );
}
