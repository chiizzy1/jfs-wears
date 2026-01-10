"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resetPasswordSchema, ResetPasswordValues } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword, isLoading } = useAuthStore();

  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token");
    }
  }, [token]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) {
      toast.error("Invalid token");
      return;
    }

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    }
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
        <div className="bg-white p-10 w-full max-w-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2 tracking-[0.02em]">Invalid Link</h1>
          <p className="text-muted-foreground text-sm mb-8">{tokenError}</p>
          <Link href="/forgot-password">
            <Button variant="default">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
        <div className="bg-white p-10 w-full max-w-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2 tracking-[0.02em]">Password Reset!</h1>
          <p className="text-muted-foreground text-sm">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <div className="bg-white p-10 w-full max-w-md border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
            JFS WEARS
          </Link>
          <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your new password</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-transparent border-gray-200 focus:border-black transition-colors"
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
                  <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-transparent border-gray-200 focus:border-black transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

/**
 * Premium Reset Password Page
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
