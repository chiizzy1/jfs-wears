import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  priceAdjustment: z.coerce.number().optional().default(0),
});

export const bulkPricingTierSchema = z.object({
  minQuantity: z.coerce.number().int().min(2, "Quantity must be at least 2"),
  discountPercent: z.coerce.number().min(0).max(100, "Discount cannot exceed 100%"),
});

export const productSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    basePrice: z.coerce.number().min(0, "Price must be positive"),
    categoryId: z.string().min(1, "Category is required"),
    gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
    isFeatured: z.boolean().optional().default(false),
    bulkEnabled: z.boolean().optional().default(false),
    variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
    bulkPricingTiers: z.array(bulkPricingTierSchema).optional(),
    salePrice: z.coerce.number().min(0).optional(),
    saleStartDate: z.string().optional().or(z.literal("")),
    saleEndDate: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.salePrice && data.basePrice && data.salePrice >= data.basePrice) {
        return false;
      }
      return true;
    },
    {
      message: "Sale price must be lower than base price",
      path: ["salePrice"],
    },
  )
  .refine(
    (data) => {
      if (data.saleStartDate && data.saleEndDate) {
        return new Date(data.saleStartDate) < new Date(data.saleEndDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["saleEndDate"],
    },
  );

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;
