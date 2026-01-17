"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Category } from "@/types/category.types";
import { categoriesService } from "@/services/categories.service";
import { CategoryForm } from "./CategoryForm";
import { CategoryMobileRow } from "./CategoryMobileRow";
import { CategoriesSkeleton } from "@/components/admin/skeletons/CategoriesSkeleton";
import { getCategoriesColumns } from "./categories-columns";

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    loadCategories();
  };

  const handleDeleteClick = (category: Category) => {
    const productCount = category._count?.products || 0;
    if (productCount > 0) {
      toast.error(
        `Cannot delete "${category.name}": ${productCount} product(s) are assigned. Please reassign or delete products first.`,
      );
      return;
    }
    setDeleteConfirm({ isOpen: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.category) return;
    try {
      await categoriesService.delete(deleteConfirm.category.id);
      toast.success("Category deleted");
      loadCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category";
      toast.error(message);
    } finally {
      setDeleteConfirm({ isOpen: false, category: null });
    }
  };

  const columns = useMemo(
    () =>
      getCategoriesColumns({
        onEdit: handleOpenModal,
        onDelete: handleDeleteClick,
      }),
    [],
  );

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
        </div>
        <Button variant="premium" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-none border-t border-gray-100">
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          renderSubComponent={(props) => <CategoryMobileRow category={props.row.original} />}
        />
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm initialData={editingCategory} onSuccess={handleFormSuccess} onCancel={handleCloseModal} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}
