import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { StorefrontView } from "@/components/admin/storefront/StorefrontView";

export default function StorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <StorefrontView />
    </Suspense>
  );
}
