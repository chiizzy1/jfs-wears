import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  getItems: (limit?: number) => RecentlyViewedItem[];
  clearHistory: () => void;
}

const MAX_ITEMS = 12;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Remove existing entry for this product
          const filtered = state.items.filter((i) => i.productId !== item.productId);

          // Add to front with timestamp
          const newItems = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);

          return { items: newItems };
        });
      },

      getItems: (limit = 8) => {
        return get().items.slice(0, limit);
      },

      clearHistory: () => {
        set({ items: [] });
      },
    }),
    {
      name: "jfs-recently-viewed-storage",
    }
  )
);
