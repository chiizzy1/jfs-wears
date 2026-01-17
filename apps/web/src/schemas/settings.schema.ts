import { z } from "zod";

// AI Provider enum
export const aiProviderSchema = z.enum(["DISABLED", "GROQ", "OPENROUTER", "GEMINI"]);
export type AiProvider = z.infer<typeof aiProviderSchema>;

export const settingsSchema = z.object({
  // General Settings
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Invalid email address"),
  currency: z.string().min(1, "Currency is required"),

  // Notifications
  notifyOrder: z.boolean().default(true),
  notifyLowStock: z.boolean().default(true),
  notifyReview: z.boolean().default(false),

  // Store Contact & Address (for receipts)
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  storeCity: z.string().optional(),
  storeState: z.string().optional(),
  storePostalCode: z.string().optional(),
  storeCountry: z.string().optional(),

  // Receipt Branding
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  receiptAccentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid HEX color")
    .optional()
    .or(z.literal("")),
  receiptFooterText: z.string().optional(),
  returnPolicyUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  termsUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // AI Configuration - Primary Provider
  aiProvider: aiProviderSchema.default("DISABLED"),
  aiApiKey: z.string().optional(),

  // AI Configuration - Fallback Provider
  aiFallbackProvider: aiProviderSchema.default("DISABLED"),
  aiFallbackApiKey: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
