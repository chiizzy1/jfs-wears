"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standardized loading spinner used throughout the admin panel.
 * Based on the design from /admin/staff page.
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return <div className={cn("animate-spin rounded-full border-t-transparent border-black", sizeClasses[size], className)} />;
}

/**
 * Full page loading state with centered spinner
 */
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Spinner size="lg" />
      {message && <p className="text-sm text-muted-foreground uppercase tracking-widest">{message}</p>}
    </div>
  );
}
