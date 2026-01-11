"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, LoginValues } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      // Redirect to intended page or home, only preventing login/register loops
      const redirectTo = searchParams.get("redirect") || "/";
      const safeRedirect = redirectTo.includes("/login") || redirectTo.includes("/register") ? "/" : redirectTo;
      router.replace(safeRedirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
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
        <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Welcome Back</h1>
        <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Password</FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="bg-transparent border-gray-200 focus:border-black transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 border border-gray-300 accent-black rounded-sm" />
              <span className="text-muted-foreground text-xs">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="default" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
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

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
          Create one
        </Link>
      </p>

      {/* Staff Login Link */}
      <p className="text-center text-xs text-muted-foreground/70 mt-4">
        Staff member?{" "}
        <a href="/admin/login" className="text-primary/70 hover:text-primary hover:underline underline-offset-4">
          Admin Login
        </a>
      </p>
    </div>
  );
}
