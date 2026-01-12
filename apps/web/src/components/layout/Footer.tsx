import Link from "next/link";

/**
 * Premium Footer
 *
 * Mason Garments-inspired: Multi-column layout, uppercase headers, payment icons
 */
export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-gray-200/50 pt-16 pb-8">
      <div className="container-width grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="col-span-1">
          <h3 className="text-lg tracking-[0.2em] uppercase font-medium mb-6">JFS WEARS</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium Nigerian fashion designed for the modern individual. Quality, style, and comfort in every piece.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Shop</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/shop?category=men" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Men's Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?category=women" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Women's Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?category=accessories" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Accessories
              </Link>
            </li>
            <li>
              <Link href="/shop/new" className="text-sm text-primary hover:opacity-60 transition-opacity">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Customer Service</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/track-order" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Returns & Exchanges
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-primary hover:opacity-60 transition-opacity">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-4">Subscribe for exclusive offers and new arrivals.</p>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 text-sm border border-gray-300 bg-transparent focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Payment Methods & Social */}
      <div className="container-width border-t border-gray-200/50 pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Payment Icons */}
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground mr-2">Pay with</span>
            {/* Visa */}
            <svg className="h-6 w-auto text-muted-foreground" viewBox="0 0 50 16" fill="currentColor">
              <path d="M19.5 3.5L17 12.5H14.5L12 3.5H14.5L16 10L17.5 3.5H19.5Z" />
              <path d="M20 3.5H22V12.5H20V3.5Z" />
              <path d="M26.5 7C24.5 6.5 24 6 24 5.5C24 5 24.5 4.5 25.5 4.5C26.5 4.5 27 5 27 5L27.5 3.5C27 3.5 26 3 25 3C23 3 21.5 4 21.5 5.5C21.5 7 22.5 7.5 24.5 8C26 8.5 26.5 9 26.5 9.5C26.5 10 26 10.5 25 10.5C24 10.5 23 10 22.5 9.5L22 11C22.5 11.5 23.5 12 25 12C27 12 29 11 29 9.5C29 8 28 7.5 26.5 7Z" />
              <path d="M35 12.5L34.5 11.5H31.5L31 12.5H28.5L32 3.5H34L37.5 12.5H35ZM32 9.5H34L33 7L32 9.5Z" />
            </svg>
            {/* Mastercard */}
            <svg className="h-6 w-auto text-muted-foreground" viewBox="0 0 50 32" fill="currentColor">
              <circle cx="18" cy="16" r="10" opacity="0.5" />
              <circle cx="32" cy="16" r="10" opacity="0.7" />
            </svg>
            {/* Bank Transfer */}
            <svg
              className="h-5 w-auto text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
            </svg>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path d="M4 4l11.5 16H20L8.5 4H4z" />
                <path d="M4 20l7-9.5M13 9.5L20 4" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200/50">
          <p className="text-xs text-muted-foreground tracking-[0.1em]">
            © {new Date().getFullYear()} JFS WEARS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
