export interface StorefrontHero {
  id: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl?: string;
  productId?: string;
  categoryId?: string;
  order: number;
  isActive: boolean;
  product?: { id: string; name: string; slug: string };
  category?: { id: string; name: string; slug: string };
}

export interface StorefrontSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "FEATURED" | "CATEGORY" | "COLLECTION";
  categoryId?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
  order: number;
  isActive: boolean;
  maxProducts: number;
  category?: { id: string; name: string; slug: string };
}
