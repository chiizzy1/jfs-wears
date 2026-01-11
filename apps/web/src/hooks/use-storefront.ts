import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  HeroSlide,
  StorefrontSection,
} from "@/services/storefront-api";
import toast from "react-hot-toast";

// ============================================
// HERO SLIDES HOOKS
// ============================================

export function useHeroSlides() {
  return useQuery({
    queryKey: ["admin", "heroes"],
    queryFn: getHeroSlides,
  });
}

export function useCreateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<HeroSlide>) => createHeroSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "heroes"] });
      toast.success("Hero slide created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create hero slide");
    },
  });
}

export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroSlide> }) => updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "heroes"] });
      toast.success("Hero slide updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update hero slide");
    },
  });
}

export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHeroSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "heroes"] });
      toast.success("Hero slide deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete hero slide");
    },
  });
}

export function useReorderHeroSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reorderHeroSlides(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "heroes"] });
      toast.success("Order saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder slides");
    },
  });
}

// ============================================
// SECTIONS HOOKS
// ============================================

export function useSections() {
  return useQuery({
    queryKey: ["admin", "sections"],
    queryFn: getSections,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StorefrontSection>) => createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success("Section created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create section");
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StorefrontSection> }) => updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success("Section updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update section");
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success("Section deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete section");
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reorderSections(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success("Order saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder sections");
    },
  });
}
