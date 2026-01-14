import { Skeleton } from "@/components/ui/skeleton";

export function GenericPageSkeleton() {
  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
      <div className="container-width space-y-8">
        {/* Header/Title Skeleton */}
        <div className="max-w-md space-y-4">
          <Skeleton className="h-4 w-24" /> {/* Breadcrumb-like */}
          <Skeleton className="h-10 w-64" /> {/* Page Title */}
        </div>

        {/* Content Skeleton - Generic Layout */}
        <div className="bg-white p-8 rounded-none border border-gray-100 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="space-y-4 pt-4">
            <Skeleton className="h-12 w-full md:w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
