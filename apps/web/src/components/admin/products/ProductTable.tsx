"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Plus, Search } from "lucide-react";
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
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        const image = product.images?.find((img) => img.isMain) || product.images?.[0];
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 overflow-hidden bg-gray-100 relative rounded-sm shrink-0">
              {image ? (
                <Image
                  src={image.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={image.url.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted">No Img</div>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted">{product.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => <span className="text-sm text-muted">{row.original.category?.name || "—"}</span>,
    },
    {
      accessorKey: "basePrice",
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.basePrice || row.original.price || 0;
        return <span className="font-medium">₦{price.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const totalStock = row.original.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        return <span className="text-sm">{totalStock}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        const styles: Record<string, string> = {
          Active: "bg-green-50 text-green-700 border-green-200",
          "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
          "Out of Stock": "bg-red-50 text-red-700 border-red-200",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium border rounded-full ${
              styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/products/${product.id}`}>
                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`Delete ${product.name}?`)) {
                  deleteProduct(product.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50/50"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild size="default" className="w-full sm:w-auto">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center border rounded-lg bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredProducts} />
      )}
    </div>
  );
}
