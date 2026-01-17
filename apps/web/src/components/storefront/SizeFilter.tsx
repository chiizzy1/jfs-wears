"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export default function SizeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current sizes from URL
  const currentSizes = searchParams.get("size")?.split(",").filter(Boolean) || [];

  const handleSizeToggle = (size: string) => {
    const params = new URLSearchParams(searchParams.toString());

    let newSizes: string[];
    if (currentSizes.includes(size)) {
      // Remove size
      newSizes = currentSizes.filter((s) => s !== size);
    } else {
      // Add size
      newSizes = [...currentSizes, size];
    }

    if (newSizes.length > 0) {
      params.set("size", newSizes.join(","));
    } else {
      params.delete("size");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-black">Size</h4>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((size) => (
          <Button
            key={size}
            variant={currentSizes.includes(size) ? "default" : "outline"}
            size="icon"
            className="w-12 h-12 text-sm"
            onClick={() => handleSizeToggle(size)}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
}
