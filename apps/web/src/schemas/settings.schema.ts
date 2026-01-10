import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Invalid email address"),
  currency: z.string().min(1, "Currency is required"),
  notifyOrder: z.boolean().default(true),
  notifyLowStock: z.boolean().default(true),
  notifyReview: z.boolean().default(false),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
