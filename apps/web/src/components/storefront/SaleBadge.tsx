"use client";

import { cn } from "@/lib/utils";

interface SaleBadgeProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SaleBadge({ price, compareAtPrice, className, size = "md" }: SaleBadgeProps) {
  if (!compareAtPrice || compareAtPrice <= price) return null;

  const discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-bold uppercase tracking-widest bg-[#D00] text-white sharp-edges",
        sizeClasses[size],
        className
      )}
    >
      -{discountPercent}% OFF
    </div>
  );
}
