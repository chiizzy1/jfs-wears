import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  // We use a simplified version of the Dashboard Skeleton for the generic admin loading (sidebar + header structure)
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-black">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Skeleton className="h-8 w-8 bg-gray-800" />
            <Skeleton className="ml-3 h-6 w-24 bg-gray-800" />
          </div>
          <div className="mt-5 flex-1 flex flex-col gap-1 px-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-gray-900/50" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <main className="flex-1 py-6 px-8">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
