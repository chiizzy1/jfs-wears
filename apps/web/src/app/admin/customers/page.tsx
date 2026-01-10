"use client";

import { useCustomers } from "@/hooks/use-customers";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";

export default function CustomersPage() {
  const { customers, isLoading, deleteCustomer } = useCustomers();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate customer "${name}"?`)) {
      deleteCustomer(id);
    }
  };

  const activeCustomersCount = customers.filter((c) => c.isActive).length;
  const customersWithOrdersCount = customers.filter((c) => c.orders && c.orders.length > 0).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-wider">Overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div className="px-6 first:pl-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Total Customers</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{customers.length}</p>
        </div>
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Active Customers</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{activeCustomersCount}</p>
        </div>
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">With Orders</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{customersWithOrdersCount}</p>
        </div>
      </div>

      {/* Table */}
      <CustomersTable data={customers} isLoading={isLoading} onDelete={handleDelete} />
    </div>
  );
}
