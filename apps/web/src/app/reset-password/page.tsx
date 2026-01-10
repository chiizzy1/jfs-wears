"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Premium Reset Password Page
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

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

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Reset failed");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
        <div className="bg-white p-10 w-full max-w-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-sale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2 tracking-[0.02em]">Invalid Link</h1>
          <p className="text-muted text-sm mb-8">{error}</p>
          <Link href="/forgot-password">
            <Button variant="primary">Request New Link</Button>
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
          <p className="text-muted text-sm">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <div className="bg-white p-10 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
            JFS WEARS
          </Link>
          <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Reset Password</h1>
          <p className="text-muted text-sm mt-2">Enter your new password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-[0.15em] text-muted mb-2">
              New Password
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
              Confirm New Password
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

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
