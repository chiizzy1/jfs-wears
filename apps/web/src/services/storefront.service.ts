import { adminAPI } from "@/lib/admin-api";
import { StorefrontHero, StorefrontSection } from "@/types/storefront.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const storefrontService = {
  // Heroes
  getHeroes: async () => {
    return adminAPI.get<StorefrontHero[]>("/admin/storefront/heroes");
  },

  createHero: async (data: FormData) => {
    // Note: We're sending JSON, not FormData, because the backend expects JSON for creating the entity.
    // The media upload is handled separately or prior to this call, returning a URL.
    return adminAPI.post<StorefrontHero>("/admin/storefront/heroes", data);
  },

  updateHero: async (id: string, data: Partial<StorefrontHero>) => {
    return adminAPI.patch<StorefrontHero>(`/admin/storefront/heroes/${id}`, data);
  },

  deleteHero: async (id: string) => {
    return adminAPI.delete(`/admin/storefront/heroes/${id}`);
  },

  // Sections
  getSections: async () => {
    return adminAPI.get<StorefrontSection[]>("/admin/storefront/sections");
  },

  createSection: async (data: Partial<StorefrontSection>) => {
    return adminAPI.post<StorefrontSection>("/admin/storefront/sections", data);
  },

  updateSection: async (id: string, data: Partial<StorefrontSection>) => {
    return adminAPI.patch<StorefrontSection>(`/admin/storefront/sections/${id}`, data);
  },

  deleteSection: async (id: string) => {
    return adminAPI.delete(`/admin/storefront/sections/${id}`);
  },

  // Media Upload
  uploadMedia: async (file: File): Promise<{ secureUrl: string; mediaType: "IMAGE" | "VIDEO" }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload/storefront`, {
      method: "POST",
      body: formData,
      // Note: We do NOT set Content-Type header here; fetch sets it automatically with boundary for FormData
      credentials: "include", // Important for cookies if needed, though adminAPI usually handles this.
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message);
    }

    return response.json();
  },

  uploadCategoryImage: async (categoryId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload/category/${categoryId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message);
    }
  },
};
