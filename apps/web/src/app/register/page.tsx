"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

/**
 * Premium Register Page
 *
 * Mason Garments-inspired: Clean form, no rounded corners, minimal design
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
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
          <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Create Account</h1>
          <p className="text-muted text-sm mt-2">Join us for exclusive deals</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="John Doe"
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" required className="mt-1 w-4 h-4 border border-gray-300 accent-black" />
            <span className="text-xs text-muted leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </span>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
