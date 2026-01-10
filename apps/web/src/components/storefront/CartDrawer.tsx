"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, CartItem } from "@/stores/cart-store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Premium Cart Drawer
 *
 * Mason Garments-inspired: Slide-out from right, upsell section, clean layout
 */
export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-sm uppercase tracking-[0.2em] font-medium">Cart</h2>
              <button onClick={onClose} className="p-2 hover:opacity-60 transition-opacity" aria-label="Close cart">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <svg
                    className="w-16 h-16 text-gray-200 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={0.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-sm text-muted mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-60 transition-opacity"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-6">
                  {items.map((item) => (
                    <CartDrawerItem
                      key={item.variantId}
                      item={item}
                      onRemove={() => removeItem(item.variantId)}
                      onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upsell Section - Only show when cart has items */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">Complete with</p>
                <div className="flex items-center gap-3 p-3 bg-secondary">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Essential Kit</p>
                    <p className="text-xs text-muted">Care products for your items</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Order Note */}
            {items.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-muted">Add order note</p>
                <p className="text-xs text-muted mt-1">Taxes and shipping calculated at checkout</p>
              </div>
            )}

            {/* Footer - Checkout Button */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-gray-100">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-center w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#333] transition-colors"
                >
                  Checkout • ₦{getTotal().toLocaleString()}
                </Link>
                <button
                  onClick={onClose}
                  className="w-full mt-4 text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors underline underline-offset-4"
                >
                  Or continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Cart Item Component
function CartDrawerItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-20 h-24 bg-secondary shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">No image</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">{item.name}</h3>
        <p className="text-xs text-muted mt-1">
          {item.size && <span>{item.size}</span>}
          {item.size && item.color && <span className="mx-1">•</span>}
          {item.color && <span>{item.color}</span>}
        </p>
        <p className="text-sm font-medium mt-2">₦{item.price.toLocaleString()}</p>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
