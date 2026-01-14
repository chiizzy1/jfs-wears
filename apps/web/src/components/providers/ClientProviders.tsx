"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import CartDrawer from "@/components/storefront/CartDrawer";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Client-side providers and global UI components
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const [queryClient] = useState(() => new QueryClient());

  // Sync auth state with cookie on app mount
  // Fixes localStorage desync when cookies are cleared manually
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeDrawer} />
    </QueryClientProvider>
  );
}
