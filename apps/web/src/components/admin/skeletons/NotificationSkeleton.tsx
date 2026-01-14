import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="py-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-3 border-b border-gray-50 last:border-0">
          <Skeleton className="w-8 h-8 rounded-none" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
