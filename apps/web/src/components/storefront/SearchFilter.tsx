"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    const newUrl = `/shop?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-black">Search</h4>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button variant="ghost" size="icon" onClick={handleClear} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
