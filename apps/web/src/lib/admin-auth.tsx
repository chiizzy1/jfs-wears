"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminAPI } from "@/lib/admin-api";

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");

    if (token && userData) {
      adminAPI.setToken(token);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await adminAPI.login(email, password);

    // Store tokens - the backend returns { user, tokens: { accessToken, refreshToken } }
    localStorage.setItem("admin_token", response.tokens.accessToken);
    adminAPI.setToken(response.tokens.accessToken);

    // Use the actual user data from the response
    const userData: AdminUser = {
      email: response.user.email,
      name: response.user.name,
      role: response.user.role,
    };

    localStorage.setItem("admin_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    adminAPI.clearToken();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
