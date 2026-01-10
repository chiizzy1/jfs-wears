"use client";

import { ProductTable } from "@/components/admin/products/ProductTable";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Products</h1>
        <p className="text-2xl font-light mt-1">Manage Catalog</p>
      </div>

      {/* Main Content */}
      <ProductTable />
    </div>
  );
}
