import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  getAuthHeader: () => Record<string, string>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Login failed");
          }

          const data = await res.json();
          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Registration failed");
          }

          const data = await res.json();
          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return false;

        try {
          const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });

          if (!res.ok) {
            get().logout();
            return false;
          }

          const data = await res.json();
          set({ tokens: data });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      getAuthHeader: (): Record<string, string> => {
        const { tokens } = get();
        if (!tokens?.accessToken) return {};
        return { Authorization: `Bearer ${tokens.accessToken}` };
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Reset failed");
          }
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "jfs-auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
