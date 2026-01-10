"use client";

import { OrdersTable } from "@/components/admin/orders/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Orders</h1>
          <p className="text-2xl font-light mt-1">Order Management</p>
        </div>
      </div>

      {/* Main Content */}
      <OrdersTable />
    </div>
  );
}
