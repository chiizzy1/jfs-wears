"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Premium Forgot Password Page
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
        <div className="bg-white p-10 w-full max-w-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2 tracking-[0.02em]">Check Your Email</h1>
          <p className="text-muted text-sm mb-8">
            If an account exists for <strong className="text-primary">{email}</strong>, we've sent password reset instructions.
          </p>
          <Link href="/login">
            <Button variant="primary">Back to Login</Button>
          </Link>
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
          <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Forgot Password?</h1>
          <p className="text-muted text-sm mt-2">Enter your email to reset your password</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-sm text-muted mt-8">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
