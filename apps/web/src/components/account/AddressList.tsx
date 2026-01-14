"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, MapPin, Phone, Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddressForm } from "@/components/account/AddressForm";
import { addressService } from "@/services/address.service";
import { Address } from "@/types/address.types";

export function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await addressService.delete(deleteId);
      toast.success("Address deleted");
      loadAddresses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete address");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  };

  if (showForm) {
    return (
      <AddressForm
        initialData={editingAddress}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 text-black">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button variant="secondary" onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-none" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No addresses yet</h3>
          <p className="text-gray-500 mb-6">Add an address to speed up checkout</p>
          <Button variant="outline" onClick={handleAddNew}>
            Add First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="group relative bg-white border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      {addr.firstName} {addr.lastName}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-black text-white px-2 py-0.5 font-bold">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {addr.address}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.country}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {addr.phone}
                </p>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold hover:text-gray-600 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(addr.id)}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-red-600 hover:text-red-700 transition-colors ml-auto"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This cannot be undone."
        variant="danger"
        icon="delete"
        confirmLabel="Delete"
      />
    </div>
  );
}
