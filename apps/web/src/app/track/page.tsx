"use client";

import { Suspense } from "react";
import { TrackOrderView } from "@/components/track/TrackOrderView";

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
