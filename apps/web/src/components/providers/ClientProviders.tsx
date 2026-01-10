"use client";

import CartDrawer from "@/components/storefront/CartDrawer";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";

/**
 * Client-side providers and global UI components
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const { isOpen, closeDrawer } = useCartDrawerStore();

  return (
    <>
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeDrawer} />
    </>
  );
}
