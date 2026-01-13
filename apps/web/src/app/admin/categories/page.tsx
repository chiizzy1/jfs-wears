"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Pencil, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiClient } from "@/lib/api-client";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  position: number;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", imageUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadCategories() {
    try {
      const data = await apiClient.get<Category[]>("/categories");
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleOpenModal(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        imageUrl: category.imageUrl || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", imageUrl: "" });
  }

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setIsUploading(true);
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload/storefront`, {
        method: "POST",
        body: uploadForm,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setFormData({ ...formData, imageUrl: result.secureUrl });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, formData);
        toast.success("Category updated");
      } else {
        await apiClient.post("/categories", formData);
        toast.success("Category created");
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteClick(category: Category) {
    const productCount = category._count?.products || 0;

    // Warn if category has products
    if (productCount > 0) {
      toast.error(
        `Cannot delete "${category.name}": ${productCount} product(s) are assigned. ` +
          `Please reassign or delete products first.`
      );
      return;
    }

    setDeleteConfirm({ isOpen: true, category });
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.category) return;

    try {
      await apiClient.delete(`/categories/${deleteConfirm.category.id}`);
      toast.success("Category deleted");
      loadCategories();
    } catch (error: any) {
      const message = error?.message || "Failed to delete category";
      toast.error(message);
    }
  }

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</span>,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "slug",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Slug</span>,
        cell: ({ row }) => <span className="text-gray-500 font-mono text-sm">{row.original.slug}</span>,
      },
      {
        accessorKey: "description",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Description</span>,
        cell: ({ row }) => (
          <span className="text-gray-500 text-sm max-w-xs truncate block">{row.original.description || "—"}</span>
        ),
      },
      {
        accessorKey: "_count.products",
        header: () => (
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Products</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center min-w-8 px-2 py-1 text-xs font-medium rounded ${
                (row.original._count?.products || 0) > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
              }`}
            >
              {row.original._count?.products || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${row.original.isActive ? "text-emerald-600" : "text-gray-400"}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${row.original.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenModal(category)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(category)}
                className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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

      {/* Categories Table via DataTable */}
      <div className="rounded-none border-t border-gray-100">
        <DataTable columns={columns} data={categories} searchKey="name" />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white p-8 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-medium mb-6">{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Hoodies"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., hoodies"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Category Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isUploading
                      ? "border-blue-400 bg-blue-50"
                      : formData.imageUrl
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center py-2">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
                      <p className="text-xs text-gray-500">Uploading...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="space-y-2">
                      <img src={formData.imageUrl} alt="Category" className="h-20 mx-auto rounded object-cover" />
                      <p className="text-xs text-green-600">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="premium" className="flex-1" disabled={isSaving || isUploading}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
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
