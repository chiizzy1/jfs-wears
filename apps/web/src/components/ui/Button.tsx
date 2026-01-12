import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "group relative overflow-hidden bg-white text-black text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 hover:text-white rounded-none",
        "premium-dark":
          "group relative overflow-hidden bg-black text-white text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 hover:text-black rounded-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        premium: "px-10 py-4", // Matches Hero Section padding
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Handle Premium Variants with Overlay
    if ((variant === "premium" || variant === "premium-dark") && !asChild) {
      const overlayColor = variant === "premium-dark" ? "bg-white" : "bg-black";

      return (
        <Comp className={cn(buttonVariants({ variant, size: size || "premium", className }))} ref={ref} {...props}>
          <span className="relative z-10">{children}</span>
          <div
            className={cn(
              "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out",
              overlayColor
            )}
          />
        </Comp>
      );
    }

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} children={children} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
