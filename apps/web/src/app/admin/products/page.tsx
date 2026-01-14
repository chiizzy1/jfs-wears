import { ProductTable } from "@/components/admin/products/ProductTable";

/**
 * Products Page (Server Component)
 * ProductTable is a Client Component handling all interactivity.
 */
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Products</h1>
        <p className="text-2xl font-light mt-1">Manage Catalog</p>
      </div>

      {/* Main Content */}
      <ProductTable />
    </div>
  );
}
