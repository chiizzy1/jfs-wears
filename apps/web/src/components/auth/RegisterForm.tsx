"use client";

import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { registerSchema } from "@/schemas/auth.schema";
import type { RegisterValues } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterValues>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      subscribe: false,
    },
  });

  async function onSubmit(data: RegisterValues) {
    setIsLoading(true);
    try {
      await register(data.email, data.password, data.name, data.subscribe ?? false);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="text-center mb-10">
        <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
          JFS WEARS
        </Link>
        <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Create Account</h1>
        <p className="text-muted-foreground text-sm mt-2">Join our exclusive community</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Password</FormLabel>
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
            name="subscribe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-gray-600 cursor-pointer">
                    Subscribe to our newsletter for exclusive offers and updates
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </div>

          <Button type="submit" size="default" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Social Login */}
      <button
        type="button"
        className="w-full px-4 py-3 border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        onClick={() => {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
          window.location.href = `${apiUrl}/auth/google`;
        }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
