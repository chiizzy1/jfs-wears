"use client";

import { cn } from "@/lib/utils";

interface ProductPriceProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
}

export function ProductPrice({ price, compareAtPrice, className, size = "md", align = "left" }: ProductPriceProps) {
  const isOnSale = compareAtPrice && compareAtPrice > price;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl", // For product details page
  };

  const compareSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2 font-medium", alignClasses[align], className)}>
      <span className={cn("text-black", sizeClasses[size])}>₦{price.toLocaleString()}</span>
      {isOnSale && (
        <span className={cn("text-muted-foreground line-through decoration-slate-400/50", compareSizeClasses[size])}>
          ₦{compareAtPrice.toLocaleString()}
        </span>
      )}
    </div>
  );
}
