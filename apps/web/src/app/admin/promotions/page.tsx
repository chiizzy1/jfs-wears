"use client";

import { useState, useEffect } from "react";
import { adminAPI, Promotion, CreatePromotionDto } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

interface PromotionFormData {
  code: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const defaultFormData: PromotionFormData = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: new Date().toISOString().split("T")[0],
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  isActive: true,
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getPromotions(true);
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promotion "${code}"?`)) return;

    try {
      await adminAPI.deletePromotion(id);
      toast.success("Promotion deleted");
      fetchPromotions();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description || "",
      type: promo.type,
      value: promo.value.toString(),
      minOrderAmount: promo.minOrderAmount?.toString() || "",
      maxDiscount: promo.maxDiscount?.toString() || "",
      usageLimit: promo.usageLimit?.toString() || "",
      validFrom: new Date(promo.validFrom).toISOString().split("T")[0],
      validTo: new Date(promo.validTo).toISOString().split("T")[0],
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error("Promotion code is required");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Promotion name is required");
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreatePromotionDto = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
      };

      if (editingPromotion) {
        await adminAPI.updatePromotion(editingPromotion.id, {
          ...payload,
          isActive: formData.isActive,
        });
        toast.success("Promotion updated successfully");
      } else {
        await adminAPI.createPromotion(payload);
        toast.success("Promotion created successfully");
      }

      closeModal();
      fetchPromotions();
    } catch (error) {
      console.error("Failed to save promotion:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activePromotions = promotions.filter((p) => p.isActive);
  const totalUsage = promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);

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
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Promotions</h1>
          <p className="text-2xl font-light mt-1">Discount Codes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPromotions}
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
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Promotion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Active Promotions</p>
          <p className="text-3xl font-light mt-3">{activePromotions.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Total Promotions</p>
          <p className="text-3xl font-light mt-3">{promotions.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Total Uses</p>
          <p className="text-3xl font-light mt-3">{totalUsage.toLocaleString()}</p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white border border-gray-100">
        {promotions.length === 0 ? (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No promotions</h3>
            <p className="mt-2 text-sm text-muted">Create a promotion to start offering discounts.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Code</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Name</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Type</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Value</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Usage</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Period</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Status</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-t border-gray-50 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="bg-secondary px-2 py-1 text-xs font-mono">{promo.code}</code>
                  </td>
                  <td className="px-6 py-4 font-medium">{promo.name}</td>
                  <td className="px-6 py-4 text-muted">{promo.type}</td>
                  <td className="px-6 py-4 font-medium">
                    {promo.type === "PERCENTAGE" ? `${promo.value}%` : `₦${promo.value.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span>{promo.usageCount}</span>
                      {promo.usageLimit && <span className="text-muted">/ {promo.usageLimit}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted text-xs">
                    {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium ${
                        promo.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(promo)} className="p-2 text-muted hover:text-black transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id, promo.code)}
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
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">
                    {editingPromotion ? "Edit Promotion" : "Create Promotion"}
                  </h2>
                  <p className="text-xl font-light mt-1">{editingPromotion ? editingPromotion.code : "New Discount Code"}</p>
                </div>
                <button onClick={closeModal} className="p-2 text-muted hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Promo Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER25"
                      disabled={!!editingPromotion}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm font-mono disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Summer Sale 25% Off"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for internal reference"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">
                      Discount Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "PERCENTAGE" | "FIXED" })}
                      className="w-full px-4 py-3 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder={formData.type === "PERCENTAGE" ? "e.g. 25" : "e.g. 5000"}
                        min="0"
                        step={formData.type === "PERCENTAGE" ? "1" : "100"}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                        {formData.type === "PERCENTAGE" ? "%" : "₦"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      placeholder="₦0"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">
                      Max Discount Cap
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="No limit"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Unlimited"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Valid From *</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Valid To *</label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                </div>

                {editingPromotion && (
                  <label className="flex items-center gap-3 p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 accent-black"
                    />
                    <div>
                      <p className="font-medium text-sm">Active</p>
                      <p className="text-xs text-muted">Enable or disable this promotion</p>
                    </div>
                  </label>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-200 text-xs uppercase tracking-[0.15em] hover:border-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingPromotion ? "Update Promotion" : "Create Promotion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
