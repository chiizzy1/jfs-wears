import { z } from "zod";

// Base fields without refinement - can be extended
const baseStaffFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"], {
    message: "Please select a role",
  }),
};

// Schema for creating new staff (password required)
export const createStaffSchema = z.object({
  ...baseStaffFields,
  password: z.string().min(6, "Password is required (min 6 chars)"),
});

// Schema for updating staff (password optional)
export const updateStaffSchema = z.object({
  ...baseStaffFields,
  password: z.string().min(6).optional().or(z.literal("")),
});

// General staff schema for display/validation (password optional)
export const staffSchema = z.object({
  ...baseStaffFields,
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export type StaffFormValues = z.infer<typeof createStaffSchema>;
export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;
