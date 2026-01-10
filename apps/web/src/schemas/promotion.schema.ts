import { z } from "zod";

export const promotionSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(1, "Value must be positive"),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().int().optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  isActive: z.boolean().default(true),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
