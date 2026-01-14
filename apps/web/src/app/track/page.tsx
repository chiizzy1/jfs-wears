import { Suspense } from "react";
import { TrackOrderView } from "@/components/track/TrackOrderView";

/**
 * Track Order Page (Server Component)
 * TrackOrderView is a Client Component handling all interactivity.
 */
export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <TrackOrderView />
    </Suspense>
  );
}
