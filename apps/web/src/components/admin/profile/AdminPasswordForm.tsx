"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { adminPasswordSchema, AdminPasswordValues } from "@/schemas/admin-profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export function AdminPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminPasswordValues>({
    resolver: zodResolver(adminPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: AdminPasswordValues) {
    setIsLoading(true);
    try {
      await apiClient.post("/staff/me/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pb-12">
      <h2 className="text-lg font-medium tracking-tight mb-8">Change Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Current Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  New Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="outline" disabled={isLoading} className="mt-4">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
