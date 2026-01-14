import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 border border-gray-100 h-[140px]">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-10 w-32 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-8 border border-gray-100 h-[400px]">
        <div className="flex justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-white p-6 border border-gray-100 h-[300px]">
          <Skeleton className="h-4 w-40 mb-6" />
          <Skeleton className="h-full w-full" />
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-100 h-[300px]">
          <div className="flex justify-between p-6 border-b border-gray-100">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20 justify-self-end" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
