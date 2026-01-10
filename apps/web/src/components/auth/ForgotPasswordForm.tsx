"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import toast from "react-hot-toast";

import { forgotPasswordSchema, ForgotPasswordValues } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual service call
      // await authService.forgotPassword(data.email);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Password reset requested for:", data.email);
      setEmailSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm">
            We've sent a password reset link to <span className="font-medium text-black">{form.getValues("email")}</span>.
          </p>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to Sign In</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Didn't receive the email?{" "}
            <button onClick={() => setEmailSent(false)} className="text-primary hover:underline">
              Click to retry
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm">
      <div className="text-center mb-10">
        <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
          JFS WEARS
        </Link>
        <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Forgot Password</h1>
        <p className="text-muted-foreground text-sm mt-2">Enter your email to receive a reset link</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="bg-transparent border-gray-200 focus:border-black transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="default" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Remember your password?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
