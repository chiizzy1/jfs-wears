"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SalesProductTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const { products, isLoading } = useProducts({ isOnSale: true });

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
    : [];

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Product</span>,
      cell: ({ row }) => {
        const product = row.original;
        const image = product.images?.find((img) => img.isMain) || product.images?.[0];
        return (
          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-20 overflow-hidden bg-secondary relative shrink-0">
              {image ? (
                <Image
                  src={image.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={image.url.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted tracking-wide">
                  No Img
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-primary uppercase tracking-wide">{product.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{product.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "basePrice",
      header: () => (
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Original Price</span>
      ),
      cell: ({ row }) => {
        const price = row.original.basePrice || row.original.price || 0;
        return <span className="text-sm font-medium line-through text-muted-foreground">₦{price.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "salePrice",
      header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Sale Price</span>,
      cell: ({ row }) => {
        const salePrice = row.original.salePrice || 0;
        return <span className="text-sm font-medium text-red-600">₦{salePrice.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "saleDates",
      header: () => <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Duration</span>,
      cell: ({ row }) => {
        const start = row.original.saleStartDate ? new Date(row.original.saleStartDate).toLocaleDateString() : "N/A";
        const end = row.original.saleEndDate ? new Date(row.original.saleEndDate).toLocaleDateString() : "N/A";
        return (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Start: {start}</span>
            <span className="text-xs text-muted-foreground">End: {end}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end gap-4" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/admin/products/${product.id}`}
              className="text-xs uppercase tracking-widest hover:text-black hover:underline underline-offset-4"
            >
              Edit Sale
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Filters Toolbar - Minimalist */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-end border-b border-gray-100 pb-6">
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
            <Input
              placeholder="SEARCH SALES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-t-0 border-x-0 border-b border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-black px-0 text-base sm:text-xs uppercase tracking-widest placeholder:text-gray-300"
            />
          </div>
        </div>

        <Button asChild variant="premium" className="px-8">
          <Link href="/admin/products">
            <span className="relative z-10">Manage Products</span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>
        </Button>
      </div>

      {/* Data Table - Editorial Style */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : (
        <div className="rounded-none border-t border-gray-100">
          {/* @ts-ignore */}
          <DataTable columns={columns} data={filteredProducts} />
        </div>
      )}
    </div>
  );
}
