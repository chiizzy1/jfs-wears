import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 4, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar Skeleton */}
      <div className="flex justify-between items-center py-4 border-b border-gray-100">
        <Skeleton className="h-10 w-64 rounded-none" />
        <Skeleton className="h-10 w-32 rounded-none" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-2">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-4 border-b border-gray-50">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
