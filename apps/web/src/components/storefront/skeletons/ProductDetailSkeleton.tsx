import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="container-width py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-3/4 w-full bg-gray-100 relative overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" /> {/* Category */}
            <Skeleton className="h-10 w-3/4" /> {/* Title */}
            <Skeleton className="h-6 w-32" /> {/* Price */}
          </div>
          <div className="space-y-6 py-8 border-y border-gray-100">
            <div className="space-y-4">
              <Skeleton className="h-4 w-16" /> {/* Color Label */}
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" /> {/* Size Label */}
                <Skeleton className="h-4 w-24" /> {/* Size Guide */}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" /> {/* Quantity */}
            <Skeleton className="h-12 w-full" /> {/* Add to Cart */}
          </div>
          <Skeleton className="h-24 w-full" /> {/* Description */}
        </div>
      </div>
    </div>
  );
}
