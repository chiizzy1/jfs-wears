"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/lib/admin-auth";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="JFS Wears" width={60} height={60} className="mx-auto mb-4 rounded-lg" />
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jfswears.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              required
            />
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <a href="/" className="hover:text-primary">
            ← Back to Store
          </a>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium text-gray-700 mb-1">Demo Credentials:</p>
          <p className="text-gray-500">Email: admin@jfswears.com</p>
          <p className="text-gray-500">Password: Admin123!</p>
        </div>
      </div>
    </div>
  );
}
