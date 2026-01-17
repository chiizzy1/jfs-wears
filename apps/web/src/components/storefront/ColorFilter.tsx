"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
  { name: "Brown", hex: "#92400E" },
  { name: "Navy", hex: "#1E3A5F" },
] as const;

export default function ColorFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current colors from URL
  const currentColors = searchParams.get("color")?.split(",").filter(Boolean) || [];

  const handleColorToggle = (color: string) => {
    const params = new URLSearchParams(searchParams.toString());

    let newColors: string[];
    if (currentColors.includes(color)) {
      // Remove color
      newColors = currentColors.filter((c) => c !== color);
    } else {
      // Add color
      newColors = [...currentColors, color];
    }

    if (newColors.length > 0) {
      params.set("color", newColors.join(","));
    } else {
      params.delete("color");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-black">Color</h4>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((color) => {
          const isSelected = currentColors.includes(color.name);
          const isLight = color.hex === "#FFFFFF" || color.hex === "#EAB308";

          return (
            <Button
              key={color.name}
              variant="ghost"
              size="icon"
              onClick={() => handleColorToggle(color.name)}
              title={color.name}
              className={cn(
                "w-10 h-10 rounded-full p-0 border-2 transition-all duration-200",
                isSelected ? "border-black ring-2 ring-offset-1 ring-black" : "border-gray-200 hover:border-gray-400",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && <Check className={cn("w-4 h-4", isLight ? "text-black" : "text-white")} strokeWidth={3} />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
