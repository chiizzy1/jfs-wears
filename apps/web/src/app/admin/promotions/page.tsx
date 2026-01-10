"use client";

import { useState } from "react";
import { usePromotions } from "@/hooks/use-promotions";
import { PromotionsTable } from "@/components/admin/promotions/PromotionsTable";
import { AddPromotionModal } from "@/components/admin/promotions/AddPromotionModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Promotion } from "@/lib/admin-api";
import { CreatePromotionDto } from "@/lib/admin-api";
import { PromotionFormValues } from "@/schemas/promotion.schema";

export default function PromotionsPage() {
  const { promotions, isLoading, createPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const handleCreate = (data: PromotionFormValues) => {
    // Transform string dates to ISO for API
    const payload: CreatePromotionDto = {
      ...data,
      type: data.type,
      value: Number(data.value),
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : 0,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : 0,
      validFrom: new Date(data.validFrom).toISOString(),
      validTo: new Date(data.validTo).toISOString(),
    };

    createPromotion.mutate(payload);
    setIsModalOpen(false);
  };

  const handleUpdate = (data: PromotionFormValues) => {
    if (!editingPromotion) return;

    const payload: CreatePromotionDto = {
      ...data,
      type: data.type,
      value: Number(data.value),
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      validFrom: new Date(data.validFrom).toISOString(),
      validTo: new Date(data.validTo).toISOString(),
    };

    updatePromotion.mutate({ id: editingPromotion.id, data: payload });
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete promotion "${code}"?`)) {
      deletePromotion.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const activePromotionsCount = promotions.filter((p) => p.isActive).length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Promotions Management</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-wider">Discount Codes & Offers</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-100 rounded-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Active Promotions</p>
          <p className="text-3xl font-light mt-3">{activePromotionsCount}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Total Promotions</p>
          <p className="text-3xl font-light mt-3">{promotions.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Total Uses</p>
          <p className="text-3xl font-light mt-3">{totalUsage.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <PromotionsTable data={promotions} isLoading={isLoading} onEdit={openEditModal} onDelete={handleDelete} />

      {/* Modal */}
      <AddPromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingPromotion ? handleUpdate : handleCreate}
        initialData={editingPromotion}
        isSubmitting={createPromotion.isPending || updatePromotion.isPending}
      />
    </div>
  );
}
