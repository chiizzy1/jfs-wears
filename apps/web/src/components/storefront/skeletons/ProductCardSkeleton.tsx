import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Image Skeleton - Match aspect-3/4 */}
      <div className="aspect-3/4 w-full bg-gray-100 relative overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Info Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" /> {/* Category */}
        <Skeleton className="h-4 w-full" /> {/* Title Line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Title Line 2 */}
        <Skeleton className="h-4 w-16" /> {/* Price */}
      </div>
    </div>
  );
}
