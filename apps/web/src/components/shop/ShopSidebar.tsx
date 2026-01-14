"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import PriceFilter from "@/components/storefront/PriceFilter";
import { Category } from "@/lib/api";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, ChevronRight } from "lucide-react";

interface ShopSidebarProps {
  categories: Category[];
  currentCategory?: string;
  onSelect?: () => void;
}

function SidebarContent({ categories, currentCategory, onSelect }: ShopSidebarProps) {
  return (
    <div className="space-y-12">
      {/* Categories Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-black px-1">Categories</h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              onClick={onSelect}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-300 rounded-md group ${
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
                className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-300 rounded-md group ${
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

      {/* Filters Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-black">Filter By</h3>

        <Suspense fallback={<div className="h-20 animate-pulse bg-gray-50 rounded-none" />}>
          <PriceFilter />
        </Suspense>
      </div>
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
            className="w-full flex items-center justify-between border-black/10 h-12 uppercase tracking-widest text-xs rounded-none"
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
