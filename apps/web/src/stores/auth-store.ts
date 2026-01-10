import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, ApiError, getErrorMessage } from "@/lib/api-client";

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

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  getAuthHeader: () => Record<string, string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<AuthResponse>("/auth/login", { email, password });
          set({
            user: data.user,
            tokens: data.tokens,
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

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<AuthResponse>("/auth/register", { email, password, name });
          set({
            user: data.user,
            tokens: data.tokens,
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

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return false;

        try {
          const data = await apiClient.post<AuthTokens>("/auth/refresh", {
            refreshToken: tokens.refreshToken,
          });
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
