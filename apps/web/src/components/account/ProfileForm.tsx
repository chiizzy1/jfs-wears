"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { profileSchema, ProfileValues } from "@/schemas/account.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { ProfileImageUpload } from "./ProfileImageUpload";

export function ProfileForm() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  async function onSubmit(data: ProfileValues) {
    setIsLoading(true);
    try {
      await apiClient.put("/users/profile", data);

      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Ideally update global user store here if needed, usually handled by auth store listener or refresh
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  // Update form defaults when user changes usually handled by re-mounting or useEffect
  // But strict react-hook-form recommendation is initialized once or use reset
  // We'll skip complex sync for now as this component mounts on page load

  return (
    <div className="bg-white p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Profile Information</h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {/* Profile Image Upload */}
      <div className="flex justify-center mb-8">
        <ProfileImageUpload />
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email is read-only */}
            <div className="space-y-2">
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </span>
              <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{user?.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{user?.phone || "Not set"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
