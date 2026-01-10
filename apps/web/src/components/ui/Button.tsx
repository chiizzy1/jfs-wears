import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
          "group relative overflow-hidden bg-white text-black text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-500 border border-black/10 hover:border-black hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        premium: "px-8 py-3", // specific padding for premium look
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

    // If premium variant, we need to inject the hover overlay div
    // Note: If asChild is true, we hope the child handles children correctly, but Slot usually merges props.
    // For simpler implementation, we'll just wrap the children if it's premium and NOT asChild.
    // However, Radix Slot merges everything. We can't easily inject the div INSIDE the child component if we use Slot.
    // But commonly users just duplicate standard button usage.

    if (variant === "premium" && !asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size: size || "premium", className }))} ref={ref} {...props}>
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
        </Comp>
      );
    }

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} children={children} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
