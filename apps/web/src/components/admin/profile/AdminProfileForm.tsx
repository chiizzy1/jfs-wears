"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/lib/admin-auth";
import { apiClient } from "@/lib/api-client";
import { adminProfileSchema, AdminProfileValues } from "@/schemas/admin-profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { AdminProfileImageUpload } from "./AdminProfileImageUpload";

export function AdminProfileForm() {
  const { user } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminProfileValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  async function onSubmit(data: AdminProfileValues) {
    setIsLoading(true);
    try {
      await apiClient.put("/staff/me/profile", data);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Ideally refresh the admin auth context here
      window.location.reload(); // Simple refresh to update user context
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pb-12 border-b border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium tracking-tight">Profile Information</h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {/* Profile Image Upload */}
      <div className="flex justify-start mb-8">
        <AdminProfileImageUpload />
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email is read-only */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email</span>
              <div className="border-b border-gray-200 py-2 text-sm text-muted-foreground">{user?.email}</div>
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Role is read-only */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Role</span>
              <div className="border-b border-gray-200 py-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="premium" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6 max-w-md">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Full Name</p>
            <p className="text-sm">{user?.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Role</p>
            <p className="text-sm inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
              {user?.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
