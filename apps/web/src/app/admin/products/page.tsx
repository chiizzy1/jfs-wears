"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminAPI, Product } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getProducts();
      const productList = Array.isArray(data) ? data : (data as any).items || (data as any).products || [];
      setProducts(productList);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    if (totalStock === 0) return "Out of Stock";
    if (totalStock <= 10) return "Low Stock";
    return "Active";
  };

  const getTotalStock = (product: Product) => {
    return product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  };

  const getProductImage = (product: Product) => {
    const primaryImage = product.images?.find((img) => img.isMain);
    return primaryImage?.url || product.images?.[0]?.url || "/logo.png";
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      await adminAPI.deleteProduct(productId);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
    const status = getStockStatus(product);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && status === "Active") ||
      (selectedStatus === "low" && status === "Low Stock") ||
      (selectedStatus === "out" && status === "Out of Stock");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Products</h1>
          <p className="text-2xl font-light mt-1">Manage Catalog</p>
        </div>
        <Link href="/admin/products/new">
          <button className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button
          onClick={fetchProducts}
          className="px-4 py-3 border border-gray-200 hover:border-black transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No products found</h3>
            <p className="mt-2 text-sm text-muted">
              {products.length === 0 ? "Get started by creating a new product." : "Try adjusting your search or filter."}
            </p>
            {products.length === 0 && (
              <Link href="/admin/products/new" className="inline-block mt-6">
                <button className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em]">Add Product</button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Product</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Category</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Price</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Stock</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Status</th>
                  <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-50 hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 overflow-hidden bg-gray-100 relative flex-shrink-0">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized={getProductImage(product).startsWith("http")}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{product.category?.name || "—"}</td>
                    <td className="px-6 py-4 font-medium">₦{(product.basePrice || product.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{getTotalStock(product)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={getStockStatus(product)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-muted hover:text-black transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-muted hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-muted uppercase tracking-[0.1em]">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border border-green-200",
    "Low Stock": "bg-amber-50 text-amber-700 border border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
      {status}
    </span>
  );
}
