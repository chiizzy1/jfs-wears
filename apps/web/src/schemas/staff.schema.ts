import { z } from "zod";

export const staffSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    role: z.enum(["ADMIN", "MANAGER", "STAFF"], {
      message: "Please select a role",
    }),
  })
  .refine((data) => {
    // Password is required for new users implies it should handled by the form usage context
    // But for the schema itself, we allow optional for edits?
    // Let's keep it simple for now and handle "required for create" in the form component or separate schema.
    return true;
  });

export const createStaffSchema = staffSchema.extend({
  password: z.string().min(6, "Password is required (min 6 chars)"),
});

export const updateStaffSchema = staffSchema.extend({
  password: z.string().min(6).optional().or(z.literal("")),
});

export type StaffFormValues = z.infer<typeof createStaffSchema>;
export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;
