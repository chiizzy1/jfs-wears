import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Zustand's persist middleware to prevent localStorage interference
vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<typeof import("zustand/middleware")>("zustand/middleware");
  return {
    ...actual,
    // Override persist to just return the store without persistence
    persist: (fn: unknown) => fn,
  };
});

// Import store AFTER mocking persist
import { useCartStore, CartItem } from "@/stores/cart-store";

// Helper to reset store between tests
const resetStore = () => {
  useCartStore.getState().clearCart();
};

// Sample cart items for testing
const mockItem1: CartItem = {
  productId: "product-1",
  variantId: "variant-1",
  name: "Test T-Shirt",
  price: 5000,
  size: "M",
  color: "Black",
  image: "/images/tshirt.jpg",
  quantity: 1,
};

const mockItem2: CartItem = {
  productId: "product-2",
  variantId: "variant-2",
  name: "Test Jeans",
  price: 15000,
  size: "32",
  color: "Blue",
  image: "/images/jeans.jpg",
  quantity: 2,
};

describe("Cart Store", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("addItem", () => {
    it("should add a new item to empty cart", () => {
      // Act
      useCartStore.getState().addItem(mockItem1);

      // Assert
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(mockItem1);
    });

    it("should add multiple different items to cart", () => {
      // Act
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Assert
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
    });

    it("should increment quantity when adding existing variant", () => {
      // Arrange - add initial item
      useCartStore.getState().addItem(mockItem1);

      // Act - add same variant again with quantity 2
      useCartStore.getState().addItem({ ...mockItem1, quantity: 2 });

      // Assert - should have 1 item with quantity 3
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });
  });

  describe("removeItem", () => {
    it("should remove item by variantId", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Act
      useCartStore.getState().removeItem("variant-1");

      // Assert
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe("variant-2");
    });

    it("should do nothing when removing non-existent item", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);

      // Act
      useCartStore.getState().removeItem("non-existent");

      // Assert
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);

      // Act
      useCartStore.getState().updateQuantity("variant-1", 5);

      // Assert
      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });

    it("should not affect other items", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Act
      useCartStore.getState().updateQuantity("variant-1", 10);

      // Assert
      const { items } = useCartStore.getState();
      expect(items.find((i: CartItem) => i.variantId === "variant-1")?.quantity).toBe(10);
      expect(items.find((i: CartItem) => i.variantId === "variant-2")?.quantity).toBe(2);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Act
      useCartStore.getState().clearCart();

      // Assert
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe("getTotal", () => {
    it("should return 0 for empty cart", () => {
      // Act
      const total = useCartStore.getState().getTotal();

      // Assert
      expect(total).toBe(0);
    });

    it("should calculate total correctly for single item", () => {
      // Arrange - item with price 5000, quantity 1
      useCartStore.getState().addItem(mockItem1);

      // Act
      const total = useCartStore.getState().getTotal();

      // Assert
      expect(total).toBe(5000);
    });

    it("should calculate total correctly for multiple items", () => {
      // Arrange
      // Item 1: price 5000 x quantity 1 = 5000
      // Item 2: price 15000 x quantity 2 = 30000
      // Total: 35000
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Act
      const total = useCartStore.getState().getTotal();

      // Assert
      expect(total).toBe(35000);
    });

    it("should update total when quantity changes", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);

      // Act
      useCartStore.getState().updateQuantity("variant-1", 3);
      const total = useCartStore.getState().getTotal();

      // Assert - 5000 x 3 = 15000
      expect(total).toBe(15000);
    });
  });

  describe("getItemCount", () => {
    it("should return 0 for empty cart", () => {
      // Act
      const count = useCartStore.getState().getItemCount();

      // Assert
      expect(count).toBe(0);
    });

    it("should count single item correctly", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);

      // Act
      const count = useCartStore.getState().getItemCount();

      // Assert
      expect(count).toBe(1);
    });

    it("should sum quantities across all items", () => {
      // Arrange
      // Item 1: quantity 1
      // Item 2: quantity 2
      // Total count: 3
      useCartStore.getState().addItem(mockItem1);
      useCartStore.getState().addItem(mockItem2);

      // Act
      const count = useCartStore.getState().getItemCount();

      // Assert
      expect(count).toBe(3);
    });

    it("should update count when quantity changes", () => {
      // Arrange
      useCartStore.getState().addItem(mockItem1);

      // Act
      useCartStore.getState().updateQuantity("variant-1", 5);
      const count = useCartStore.getState().getItemCount();

      // Assert
      expect(count).toBe(5);
    });
  });
});
