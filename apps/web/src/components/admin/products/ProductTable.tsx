"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Removed unused icons
import Link from "next/link";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProductTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { products, categories, isLoading, deleteProduct } = useProducts();

  // Helper for stock status
  const getStockStatus = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    if (totalStock === 0) return "Out of Stock";
    if (totalStock <= 10) return "Low Stock";
    return "Active";
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Product</span>,
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
      accessorKey: "category.name",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Category</span>,
      cell: ({ row }) => (
        <span className="text-sm font-medium uppercase tracking-wide">{row.original.category?.name || "—"}</span>
      ),
    },
    {
      accessorKey: "basePrice",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Price</span>,
      cell: ({ row }) => {
        const price = row.original.basePrice || row.original.price || 0;
        return <span className="text-sm font-medium">₦{price.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "stock",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Stock</span>,
      cell: ({ row }) => {
        const totalStock = row.original.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        return <span className="text-sm font-mono">{totalStock}</span>;
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        const colors: Record<string, string> = {
          Active: "bg-green-500",
          "Low Stock": "bg-amber-500",
          "Out of Stock": "bg-red-500",
        };
        return (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${colors[status] || "bg-gray-500"}`} />
            <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{status}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              href={`/admin/products/${product.id}`}
              className="text-xs uppercase tracking-widest hover:text-black hover:underline underline-offset-4"
            >
              Edit
            </Link>
            <button
              onClick={() => {
                if (confirm(`Delete ${product.name}?`)) {
                  deleteProduct(product.id);
                }
              }}
              className="text-xs uppercase tracking-widest text-red-500 hover:text-red-600 hover:underline underline-offset-4"
            >
              Delete
            </button>
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
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-t-0 border-x-0 border-b border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-black px-0 text-xs uppercase tracking-widest placeholder:text-gray-300"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] rounded-none border-t-0 border-x-0 border-b border-gray-200 focus:ring-0 text-xs uppercase tracking-widest">
              <SelectValue placeholder="CATEGORY" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-gray-100">
              <SelectItem value="all" className="text-xs uppercase tracking-widest">
                All Categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name} className="text-xs uppercase tracking-widest">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button asChild variant="premium" className="px-8">
          <Link href="/admin/products/new">
            <span className="relative z-10">Add Product</span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>
        </Button>
      </div>

      {/* Data Table - Editorial Style */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="rounded-none border-t border-gray-100">
          {/* Note: Use a custom table renderer or clean wrapper if DataTable imposes styles. Assuming standard shadcn table passed in props. */}
          <DataTable columns={columns} data={filteredProducts} />
        </div>
      )}
    </div>
  );
}
