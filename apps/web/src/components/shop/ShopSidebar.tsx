"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import PriceFilter from "@/components/storefront/PriceFilter";
import GenderFilter from "@/components/storefront/GenderFilter";
import SizeFilter from "@/components/storefront/SizeFilter";
import ColorFilter from "@/components/storefront/ColorFilter";
import OnSaleFilter from "@/components/storefront/OnSaleFilter";
import SearchFilter from "@/components/storefront/SearchFilter";
import { Category } from "@/lib/api";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, ChevronRight } from "lucide-react";

interface ShopSidebarProps {
  categories: Category[];
  currentCategory?: string;
  onSelect?: () => void;
}

function FilterSkeleton() {
  return <div className="h-20 animate-pulse bg-gray-50" />;
}

function SidebarContent({ categories, currentCategory, onSelect }: ShopSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Search */}
      <Suspense fallback={<FilterSkeleton />}>
        <SearchFilter />
      </Suspense>

      {/* On Sale Toggle */}
      <Suspense fallback={<FilterSkeleton />}>
        <OnSaleFilter />
      </Suspense>

      {/* Categories Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-black px-1">Categories</h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              onClick={onSelect}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-300 group ${
                !currentCategory ? "bg-black/5 font-medium text-black" : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span>All Products</span>
              {!currentCategory && <ChevronRight className="w-4 h-4 text-black/40" />}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                onClick={onSelect}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-300 group ${
                  currentCategory === cat.slug
                    ? "bg-black/5 font-medium text-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <span>{cat.name}</span>
                {currentCategory === cat.slug && <ChevronRight className="w-4 h-4 text-black/40" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Gender Filter */}
      <div className="border-t border-gray-100 pt-6">
        <Suspense fallback={<FilterSkeleton />}>
          <GenderFilter />
        </Suspense>
      </div>

      {/* Size Filter */}
      <div className="border-t border-gray-100 pt-6">
        <Suspense fallback={<FilterSkeleton />}>
          <SizeFilter />
        </Suspense>
      </div>

      {/* Color Filter */}
      <div className="border-t border-gray-100 pt-6">
        <Suspense fallback={<FilterSkeleton />}>
          <ColorFilter />
        </Suspense>
      </div>

      {/* Price Filter */}
      <Suspense fallback={<FilterSkeleton />}>
        <PriceFilter />
      </Suspense>
    </div>
  );
}

export function ShopSidebar({ categories, currentCategory }: ShopSidebarProps) {
  return (
    <aside className="lg:w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 pr-8">
        <SidebarContent categories={categories} currentCategory={currentCategory} />
      </div>
    </aside>
  );
}

export function ShopMobileFilter({ categories, currentCategory }: ShopSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden w-full mb-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between border-black/10 h-12 uppercase tracking-widest text-xs"
          >
            <span>Filter & Sort</span>
            <Filter className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto" data-lenis-prevent>
          <SheetHeader className="mb-8 text-left">
            <SheetTitle className="text-lg font-bold uppercase tracking-widest">Filters</SheetTitle>
          </SheetHeader>
          <SidebarContent categories={categories} currentCategory={currentCategory} onSelect={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
