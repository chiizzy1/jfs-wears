"use client";

import { useState, useEffect } from "react";
import { adminAPI, User } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getUsers({ limit: 50 });
      const customerList = Array.isArray(data) ? data : data.items || [];
      setCustomers(customerList);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate customer "${name}"?`)) return;

    try {
      await adminAPI.deleteUser(id);
      toast.success("Customer deactivated");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to deactivate customer");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCustomers = customers.filter((c) => (c.name || c.email).toLowerCase().includes(searchQuery.toLowerCase()));

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
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Customers</h1>
          <p className="text-2xl font-light mt-1">Customer Management</p>
        </div>
        <button
          onClick={fetchCustomers}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Total Customers</p>
          <p className="text-3xl font-light mt-3">{customers.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Active Customers</p>
          <p className="text-3xl font-light mt-3">{customers.filter((c) => c.isActive).length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">With Orders</p>
          <p className="text-3xl font-light mt-3">{customers.filter((c) => c.orders && c.orders.length > 0).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 border border-gray-100">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-100">
        {filteredCustomers.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No customers found</h3>
            <p className="mt-2 text-sm text-muted">
              {customers.length === 0 ? "Customers will appear when they register." : "Try a different search."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Customer</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Email</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Orders</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Joined</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Status</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-gray-50 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{customer.name || "—"}</td>
                  <td className="px-6 py-4 text-muted">{customer.email}</td>
                  <td className="px-6 py-4">{customer.orders?.length || 0}</td>
                  <td className="px-6 py-4 text-muted">{formatDate(customer.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium ${
                        customer.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(customer.id, customer.name || customer.email)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-muted uppercase tracking-[0.1em]">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
