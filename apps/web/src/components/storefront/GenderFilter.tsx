"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const GENDER_OPTIONS = [
  { value: "", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
] as const;

export default function GenderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGender = searchParams.get("gender") || "";

  const handleGenderChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("gender", value);
    } else {
      params.delete("gender");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-black">Gender</h4>
      <div className="flex flex-wrap gap-2">
        {GENDER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentGender === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleGenderChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
