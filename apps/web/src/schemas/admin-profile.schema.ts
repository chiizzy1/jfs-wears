import { z } from "zod";

export const adminProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const adminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AdminProfileValues = z.infer<typeof adminProfileSchema>;
export type AdminPasswordValues = z.infer<typeof adminPasswordSchema>;
