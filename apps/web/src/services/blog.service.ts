import { apiClient as api } from "@/lib/api-client";
import { BlogPost, BlogPostResponse } from "@/types/blog";

/** Input type for creating/updating blog posts */
export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export const blogService = {
  getAllAdmin: async () => {
    return await api.get<BlogPost[]>("/admin/blog");
  },

  getAllPublished: async () => {
    return await api.get<BlogPost[]>("/blog");
  },

  getBySlug: async (slug: string) => {
    return await api.get<BlogPost>(`/blog/${slug}`);
  },

  getById: async (id: string) => {
    return await api.get<BlogPost>(`/admin/blog/${id}`);
  },

  create: async (data: BlogPostInput): Promise<BlogPost> => {
    return await api.post<BlogPost>("/admin/blog", data);
  },

  update: async (id: string, data: Partial<BlogPostInput>): Promise<BlogPost> => {
    return await api.patch<BlogPost>(`/admin/blog/${id}`, data);
  },

  delete: async (id: string) => {
    return await api.delete(`/admin/blog/${id}`);
  },

  uploadImage: async (file: File): Promise<{ secureUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${API_BASE_URL}/upload/blog`, {
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
