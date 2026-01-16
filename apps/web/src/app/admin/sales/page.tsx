import { SalesProductTable } from "@/components/admin/products/SalesProductTable";

export default function SalesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-light tracking-tight uppercase">Active Sales</h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Manage actively discounted products. Products appear here when they have a sale price set.
        </p>
      </div>

      <SalesProductTable />
    </div>
  );
}
