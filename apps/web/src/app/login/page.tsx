"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

/**
 * Premium Login Page
 *
 * Mason Garments-inspired: Clean form, no rounded corners, minimal design
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <div className="bg-white p-10 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
            JFS WEARS
          </Link>
          <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Welcome Back</h1>
          <p className="text-muted text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 border border-gray-300 accent-black" />
              <span className="text-muted text-xs">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-muted uppercase tracking-[0.1em]">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Social Login */}
        <button
          type="button"
          className="w-full px-4 py-3 border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm"
          onClick={() => toast.error("Social login coming soon!")}
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
        <p className="text-center text-sm text-muted mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
