import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * Premium Button Component
 *
 * Mason Garments-inspired: Black rectangle, uppercase text, wide letter-spacing
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles - NO rounded corners, premium typography
        "inline-flex items-center justify-center font-medium uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Letter-spacing for premium feel
        "tracking-[0.15em]",
        // Variants
        {
          // Primary & Accent - Solid black
          "bg-black text-white hover:bg-[#333]": variant === "primary" || variant === "accent",
          // Secondary - Light background
          "bg-secondary text-primary border border-gray-200 hover:bg-gray-100": variant === "secondary",
          // Outline - Black border
          "border border-black bg-transparent text-black hover:bg-black hover:text-white": variant === "outline",
          // Ghost - Minimal
          "hover:bg-gray-100 text-primary": variant === "ghost",
        },
        // Sizes - Generous padding for premium feel
        {
          "h-10 px-6 text-xs": size === "sm",
          "h-12 px-8 text-sm": size === "md",
          "h-14 px-10 text-sm": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
