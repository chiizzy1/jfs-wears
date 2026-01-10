"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export default function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Debounce the input values to avoid spamming the URL
  const [debouncedMin] = useDebounce(minPrice, 500);
  const [debouncedMax] = useDebounce(maxPrice, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedMin) {
      params.set("minPrice", debouncedMin);
    } else {
      params.delete("minPrice");
    }

    if (debouncedMax) {
      params.set("maxPrice", debouncedMax);
    } else {
      params.delete("maxPrice");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [debouncedMin, debouncedMax, router, searchParams]);

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="font-bold text-lg mb-4">Price Range</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
        />
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}
