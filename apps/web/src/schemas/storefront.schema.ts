import { z } from "zod";

export const heroSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  mediaUrl: z.string().min(1, "Media is required"),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  isActive: z.boolean(),
});

export type HeroFormValues = z.infer<typeof heroSchema>;

export const sectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  type: z.enum(["FEATURED", "CATEGORY", "COLLECTION"]),
  categoryId: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  maxProducts: z.coerce.number().min(1).max(50),
  isActive: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
