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

  // Media Upload with progress tracking
  uploadMedia: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ secureUrl: string; mediaType: "IMAGE" | "VIDEO" }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Invalid response from server"));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      xhr.open("POST", `${API_BASE_URL}/upload/storefront`);
      xhr.withCredentials = true; // Include cookies
      xhr.send(formData);
    });
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

  toggleCategoryFeatured: async (categoryId: string, featured: boolean, position?: number): Promise<void> => {
    return adminAPI.put(`/categories/${categoryId}/featured`, { featured, position });
  },

  updateCategoryFeaturedPosition: async (categoryId: string, position: number): Promise<void> => {
    return adminAPI.put(`/categories/${categoryId}/featured-position`, { position });
  },
};
