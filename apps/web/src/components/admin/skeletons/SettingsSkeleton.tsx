import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* General Information */}
      <div className="pb-12 border-b border-gray-100">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="pb-12 border-b border-gray-100">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4 max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-5 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateways */}
      <div className="pb-12">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4 max-w-2xl">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
