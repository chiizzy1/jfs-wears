import { adminAPI } from "@/lib/admin-api";
import { Category, CategoryFormData } from "@/types/category.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const categoriesService = {
  getAll: async () => {
    return adminAPI.get<Category[]>("/categories");
  },

  getOne: async (id: string) => {
    return adminAPI.get<Category>(`/categories/${id}`);
  },

  create: async (data: CategoryFormData) => {
    return adminAPI.post<Category>("/categories", data);
  },

  update: async (id: string, data: Partial<CategoryFormData>) => {
    return adminAPI.put<Category>(`/categories/${id}`, data);
  },

  delete: async (id: string) => {
    return adminAPI.delete<void>(`/categories/${id}`);
  },

  uploadImage: async (file: File): Promise<{ secureUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload/storefront`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || "Upload failed");
    }

    return res.json();
  },
};
