"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

import { loginSchema, LoginValues } from "@/schemas/auth.schema";
import { useAdminAuth } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      toast.success("Welcome back, Admin!");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm relative">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold rounded-full">
          A
        </div>
        <h1 className="text-2xl font-medium tracking-[0.02em]">Admin Portal</h1>
        <p className="text-muted-foreground text-sm mt-2">Sign in to manage your store</p>
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
                    placeholder="admin@example.com"
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

          <Button type="submit" size="default" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      {/* Demo credentials hint */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-100 text-sm rounded-none">
        <p className="font-medium text-gray-900 mb-1 text-xs uppercase tracking-wider">Demo Credentials</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
          <span>Email:</span>
          <span className="font-mono">admin@jfswears.com</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <span>Password:</span>
          <span className="font-mono">Admin123!</span>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary underline underline-offset-4 text-xs uppercase tracking-wide">
          ← Back to Store
        </a>
      </div>
    </div>
  );
}
