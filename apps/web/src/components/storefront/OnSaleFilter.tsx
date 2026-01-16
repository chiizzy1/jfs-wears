"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function OnSaleFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnSale = searchParams.get("isOnSale") === "true";

  const handleToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set("isOnSale", "true");
    } else {
      params.delete("isOnSale");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label htmlFor="on-sale-toggle" className="font-semibold text-sm text-black cursor-pointer">
        🔥 On Sale Only
      </Label>
      <Switch id="on-sale-toggle" checked={isOnSale} onCheckedChange={handleToggle} />
    </div>
  );
}
