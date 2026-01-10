"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import CartDrawer from "@/components/storefront/CartDrawer";
import { useCartDrawerStore } from "@/stores/cart-drawer-store";

/**
 * Client-side providers and global UI components
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeDrawer} />
    </QueryClientProvider>
  );
}
