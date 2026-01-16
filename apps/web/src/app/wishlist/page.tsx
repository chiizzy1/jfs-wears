"use client";

import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { PageHero } from "@/components/common/PageHero";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addCartItem = useCartStore((state) => state.addItem);

  const handleMoveToCart = (item: (typeof items)[0]) => {
    // This adds a basic item - in real scenario, user would need to select variant
    // For now, we redirect to product page for variant selection
    toast.success("Visit the product page to select size and color");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary pt-24 pb-12">
        <div className="container-width">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
          <div className="bg-white p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon on products.</p>
            <Link href="/shop">
              <Button variant="secondary">Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-12">
      <PageHero title={`My Wishlist (${items.length})`} alignment="center" />

      <div className="container-width">
        <div className="flex items-center justify-end mb-8">
          <Button
            variant="outline"
            onClick={() => {
              clearWishlist();
              toast.success("Wishlist cleared");
            }}
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.productId} className="bg-white overflow-hidden shadow-sm group">
              {/* Image */}
              <Link href={`/product/${item.slug}`} className="block relative aspect-3/4 bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link href={`/product/${item.slug}`}>
                  <h3 className="font-medium text-primary line-clamp-2 mb-2 hover:text-accent transition-colors">{item.name}</h3>
                </Link>
                <p className="font-bold text-lg mb-4">₦{item.price.toLocaleString()}</p>

                <div className="flex gap-2">
                  <Link href={`/product/${item.slug}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Product
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success("Removed from wishlist");
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
