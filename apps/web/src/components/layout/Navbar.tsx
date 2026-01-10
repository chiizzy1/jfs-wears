"use client";

import Link from "next/link";
import { useCartStore, CartState } from "@/stores/cart-store";
import { useWishlistStore, WishlistState } from "@/stores/wishlist-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Premium Navigation Bar
 *
 * Mason Garments-inspired: Text logo, thin-stroke icons, wide letter-spacing
 */
export default function Navbar() {
  const router = useRouter();
  const itemCount = useCartStore((state: CartState) => state.getItemCount());
  const wishlistCount = useWishlistStore((state: WishlistState) => state.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-secondary sticky top-0 z-50 border-b border-gray-200/50">
      <div className="container-width flex items-center justify-between h-20">
        {/* Text-Only Logo - Premium Style */}
        <Link href="/" className="flex items-center">
          <span className="text-lg tracking-[0.2em] uppercase font-medium text-primary">JFS WEARS</span>
        </Link>

        {/* Desktop Links - Wide Letter-Spacing */}
        <div className="hidden md:flex items-center space-x-10">
          <Link href="/shop" className="text-xs uppercase tracking-[0.15em] text-primary hover:opacity-60 transition-opacity">
            Shop
          </Link>
          <Link
            href="/shop?gender=men"
            className="text-xs uppercase tracking-[0.15em] text-primary hover:opacity-60 transition-opacity"
          >
            Men
          </Link>
          <Link
            href="/shop?gender=women"
            className="text-xs uppercase tracking-[0.15em] text-primary hover:opacity-60 transition-opacity"
          >
            Women
          </Link>
          <Link href="/story" className="text-xs uppercase tracking-[0.15em] text-primary hover:opacity-60 transition-opacity">
            Our Story
          </Link>
        </div>

        {/* Actions - Thin Stroke Icons */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-48 md:w-64 px-4 py-2 text-sm border-b border-black bg-transparent focus:outline-none"
                  onBlur={() => !searchQuery && setShowSearch(false)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button onClick={() => setShowSearch(true)} className="p-2 hover:opacity-60 transition-opacity" aria-label="Search">
                {/* Thin stroke search icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
          </div>

          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 hover:opacity-60 transition-opacity relative" aria-label="Wishlist">
            {/* Thin stroke heart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="p-2 hover:opacity-60 transition-opacity relative" aria-label="Cart">
            {/* Thin stroke bag icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {mounted && isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:opacity-60 transition-opacity"
              >
                <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-medium text-xs">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs uppercase tracking-widest">{user.name || "Account"}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown - Clean, no rounded corners */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-gray-100 py-2 animate-fade-in">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Wishlist
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest text-sale hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex bg-black text-white px-6 py-2 text-xs uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
