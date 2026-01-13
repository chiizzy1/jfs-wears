import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  image: string;
  quantity: number;
  bulkPricingTiers?: { minQuantity: number; discountPercent: number }[];
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.variantId === item.variantId);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += item.quantity;
            // distinct update bulk tiers if they changed (unlikely but safe)
            if (item.bulkPricingTiers) {
              updatedItems[existingIndex].bulkPricingTiers = item.bulkPricingTiers;
            }
            return { items: updatedItems };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const items = get().items;

        // Group by product to calculate mix & match totals
        const productQuantities = new Map<string, number>();
        items.forEach((item) => {
          const current = productQuantities.get(item.productId) || 0;
          productQuantities.set(item.productId, current + item.quantity);
        });

        return items.reduce((total, item) => {
          let itemPrice = item.price;

          if (item.bulkPricingTiers && item.bulkPricingTiers.length > 0) {
            const totalQty = productQuantities.get(item.productId) || 0;
            // Find highest applicable tier
            const tier = item.bulkPricingTiers
              .sort((a, b) => b.minQuantity - a.minQuantity) // Descending
              .find((t) => totalQty >= t.minQuantity);

            if (tier) {
              itemPrice = itemPrice * (1 - tier.discountPercent / 100);
            }
          }

          return total + itemPrice * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "jfs-cart-storage",
    }
  )
);
