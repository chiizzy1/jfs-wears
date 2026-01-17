"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaff } from "@/hooks/use-staff";
import { Staff } from "@/lib/admin-api";

const editStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
  isActive: z.boolean(),
});

type EditStaffFormValues = z.infer<typeof editStaffSchema>;

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export function EditStaffModal({ isOpen, onClose, staff }: EditStaffModalProps) {
  const { updateStaff } = useStaff();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditStaffFormValues>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "STAFF",
      isActive: true,
    },
  });

  // Reset form when staff changes
  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        email: staff.email,
        role: staff.role as "ADMIN" | "MANAGER" | "STAFF",
        isActive: staff.isActive,
      });
    }
  }, [staff, reset]);

  const onSubmit = async (data: EditStaffFormValues) => {
    if (!staff) return;

    await updateStaff.mutateAsync({
      id: staff.id,
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Edit Staff Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest">
              Full Name
            </Label>
            <Input id="name" {...register("name")} placeholder="Enter full name" className="border-gray-200" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest">
              Email
            </Label>
            <Input id="email" type="email" {...register("email")} placeholder="Enter email address" className="border-gray-200" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs uppercase tracking-widest">
              Role
            </Label>
            <select
              id="role"
              {...register("role")}
              className="w-full px-3 py-2 border border-gray-200 text-base sm:text-sm cursor-pointer"
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 cursor-pointer" />
            <Label htmlFor="isActive" className="text-sm cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={isSubmitting || updateStaff.isPending}>
              {isSubmitting || updateStaff.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
