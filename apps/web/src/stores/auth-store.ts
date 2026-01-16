import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, ApiError, getErrorMessage } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, subscribe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
  setUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Customer login only - staff must use /admin/login
          const data = await apiClient.post<AuthResponse>("/auth/login", { email, password });
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error instanceof ApiError ? error : new ApiError(0, message);
        }
      },

      register: async (email: string, password: string, name?: string, subscribe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<AuthResponse>("/auth/register", { email, password, name, subscribe });
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error instanceof ApiError ? error : new ApiError(0, message);
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint to clear cookies
          await apiClient.post("/auth/logout");
        } catch {
          // Ignore logout errors
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Check if user is authenticated by calling /auth/me
       * Used on app load to verify cookie auth state
       */
      checkAuth: async () => {
        try {
          const data = await apiClient.get<{ user: User }>("/auth/me");
          set({
            user: data.user,
            isAuthenticated: true,
          });
        } catch {
          // Not authenticated - clear state
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post("/auth/reset-password", { token, password });
          set({ isLoading: false });
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error instanceof ApiError ? error : new ApiError(0, message);
        }
      },

      clearError: () => set({ error: null }),

      setUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },
    }),
    {
      name: "jfs-auth-storage",
      // Only persist user info, NOT tokens (tokens are in httpOnly cookies)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
