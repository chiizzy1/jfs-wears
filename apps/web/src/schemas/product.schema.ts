import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  priceAdjustment: z.coerce.number().optional().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  isFeatured: z.boolean().optional().default(false),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;
