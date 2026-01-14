"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) setEmail(emailFromUrl);
    if (tokenFromUrl) setCode(tokenFromUrl);

    // Auto-verify if both token and email are in URL
    if (tokenFromUrl && emailFromUrl) {
      handleVerify(emailFromUrl, tokenFromUrl);
    }
  }, [searchParams]);

  const handleVerify = async (emailToVerify?: string, tokenToVerify?: string) => {
    const verifyEmail = emailToVerify || email;
    const verifyCode = tokenToVerify || code;

    if (!verifyEmail || !verifyCode) {
      toast.error("Please enter your email and verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/verify-email", { email: verifyEmail, token: verifyCode });
      setVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsResending(true);
    try {
      await apiClient.post("/auth/resend-verification", { email });
      toast.success("Verification code sent!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium mb-2">Email Verified!</h1>
        <p className="text-muted-foreground mb-6">Your account is now active. Redirecting to login...</p>
        <Link href="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-10 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="text-center mb-10">
        <Link href="/" className="text-lg tracking-[0.2em] uppercase font-medium text-primary">
          JFS WEARS
        </Link>
        <h1 className="text-2xl font-medium mt-6 tracking-[0.02em]">Verify Your Email</h1>
        <p className="text-muted-foreground text-sm mt-2">Enter the 6-digit code sent to your email</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>}

      <div className="space-y-6">
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-2">Email Address</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-gray-200 focus:border-black transition-colors"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-2">Verification Code</label>
          <Input
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="bg-transparent border-gray-200 focus:border-black transition-colors text-center text-2xl tracking-[0.5em] font-mono"
          />
        </div>

        <Button onClick={() => handleVerify()} className="w-full" disabled={isLoading || !email || !code}>
          {isLoading ? <Spinner size="sm" className="border-white" /> : "Verify Email"}
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={isResending || !email}
            className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 h-auto p-0 hover:bg-transparent"
          >
            {isResending ? "Sending..." : "Didn't receive the code? Resend"}
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
