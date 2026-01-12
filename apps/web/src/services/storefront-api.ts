"use client";

import { apiClient, getErrorMessage } from "@/lib/api-client";

// ============================================
// TYPES
// ============================================

export type MediaType = "IMAGE" | "VIDEO";

export interface HeroSlide {
  id: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl?: string;
  product?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  order: number;
  isActive: boolean;
}

export interface StorefrontSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "FEATURED" | "CATEGORY" | "COLLECTION";
  mediaUrl?: string;
  mediaType?: MediaType;
  category?: { id: string; name: string; slug: string } | null;
  order: number;
  isActive: boolean;
  maxProducts: number;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    image: string | null;
    category: { id: string; name: string; slug: string } | null;
  }>;
}

export interface StorefrontData {
  heroes: HeroSlide[];
  sections: StorefrontSection[];
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Fetch public storefront data (heroes + sections with products)
 */
export async function getPublicStorefront(): Promise<StorefrontData> {
  try {
    const data = await apiClient.get<StorefrontData>("/storefront");
    return data;
  } catch (error) {
    console.error("Failed to fetch storefront data:", getErrorMessage(error));
    // Return empty data on error - components should handle gracefully
    return { heroes: [], sections: [] };
  }
}

// ============================================
// ADMIN API
// ============================================

// Hero CRUD
export async function getHeroSlides(): Promise<HeroSlide[]> {
  return apiClient.get<HeroSlide[]>("/admin/storefront/heroes");
}

export async function createHeroSlide(data: Partial<HeroSlide>): Promise<HeroSlide> {
  return apiClient.post<HeroSlide>("/admin/storefront/heroes", data);
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlide>): Promise<HeroSlide> {
  return apiClient.patch<HeroSlide>(`/admin/storefront/heroes/${id}`, data);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await apiClient.delete(`/admin/storefront/heroes/${id}`);
}

export async function reorderHeroSlides(ids: string[]): Promise<void> {
  await apiClient.post("/admin/storefront/heroes/reorder", { ids });
}

// Section CRUD
export async function getSections(): Promise<StorefrontSection[]> {
  return apiClient.get<StorefrontSection[]>("/admin/storefront/sections");
}

export async function createSection(data: Partial<StorefrontSection>): Promise<StorefrontSection> {
  return apiClient.post<StorefrontSection>("/admin/storefront/sections", data);
}

export async function updateSection(id: string, data: Partial<StorefrontSection>): Promise<StorefrontSection> {
  return apiClient.patch<StorefrontSection>(`/admin/storefront/sections/${id}`, data);
}

export async function deleteSection(id: string): Promise<void> {
  await apiClient.delete(`/admin/storefront/sections/${id}`);
}

export async function reorderSections(ids: string[]): Promise<void> {
  await apiClient.post("/admin/storefront/sections/reorder", { ids });
}
