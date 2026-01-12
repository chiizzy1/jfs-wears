"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import toast from "react-hot-toast";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    isDefault: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/account/addresses");
    } else if (mounted && isAuthenticated) {
      loadAddresses();
    }
  }, [mounted, isAuthenticated, router]);

  const loadAddresses = async () => {
    try {
      const data = await apiClient.get<Address[]>("/users/addresses");
      setAddresses(data);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await apiClient.put(`/users/addresses/${editingId}`, formData);
      } else {
        await apiClient.post("/users/addresses", formData);
      }

      toast.success(editingId ? "Address updated" : "Address added");
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAddresses();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/users/addresses/${deleteConfirm.id}`);
      toast.success("Address deleted");
      loadAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleEdit = (addr: Address) => {
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      landmark: addr.landmark || "",
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      landmark: "",
      isDefault: false,
    });
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/account" className="text-sm text-gray-500 hover:text-accent">
              ← Back to Account
            </Link>
            <h1 className="text-3xl font-bold mt-2">My Addresses</h1>
          </div>
          {!showForm && (
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowForm(true);
                setEditingId(null);
              }}
            >
              + Add Address
            </Button>
          )}
        </div>

        {/* Address Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold mb-4">{editingId ? "Edit Address" : "New Address"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <input
                type="text"
                placeholder="Landmark (optional)"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                Set as default address
              </label>
              <div className="flex gap-3">
                <Button type="submit" variant="secondary">
                  Save Address
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No saved addresses yet</p>
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {addr.firstName} {addr.lastName}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{addr.address}</p>
                    <p className="text-gray-600 text-sm">
                      {addr.city}, {addr.state}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(addr)} className="text-sm text-accent hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(addr.id)} className="text-sm text-error hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}
