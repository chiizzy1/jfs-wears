import React from "react";

/**
 * Standardized Table Header Component
 *
 * Provides consistent styling for data table column headers
 * following the editorial/premium design system.
 */

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return <span className={`text-xs uppercase tracking-widest text-muted-foreground font-medium ${className}`}>{children}</span>;
}

/**
 * Header text for sortable columns
 */
interface SortableHeaderProps extends TableHeaderProps {
  sorted?: "asc" | "desc" | false;
}

export function SortableHeader({ children, sorted, className = "" }: SortableHeaderProps) {
  return (
    <span
      className={`text-xs uppercase tracking-widest text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors ${className}`}
    >
      {children}
      {sorted === "asc" && " ↑"}
      {sorted === "desc" && " ↓"}
    </span>
  );
}
