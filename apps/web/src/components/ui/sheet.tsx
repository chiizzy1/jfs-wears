"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function Sheet({
  children,
  open: openProp,
  onOpenChange: setOpenProp,
  defaultOpen = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = openProp !== undefined ? openProp : isOpen;
  const setOpen = setOpenProp || setIsOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      <SheetPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
        {children}
      </SheetPrimitive.Root>
    </SheetContext.Provider>
  );
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof SheetPrimitive.Overlay>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>) {
  return (
    <SheetPrimitive.Overlay asChild>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        data-slot="sheet-overlay"
        className={cn("fixed inset-0 z-50 bg-black/50", className)}
        {...props}
      />
    </SheetPrimitive.Overlay>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: Omit<
  React.ComponentProps<typeof SheetPrimitive.Content>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { open } = React.useContext(SheetContext);

  const variants = {
    top: { y: "-100%" },
    bottom: { y: "100%" },
    left: { x: "-100%" },
    right: { x: "100%" },
  };

  const initial = variants[side];
  const animate = { x: 0, y: 0 };
  const exit = variants[side];

  return (
    <SheetPortal forceMount>
      <AnimatePresence mode="wait">
        {open && (
          <>
            <SheetOverlay />
            <SheetPrimitive.Content asChild>
              <motion.div
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
                data-slot="sheet-content"
                className={cn(
                  "bg-background fixed z-50 flex flex-col gap-4 shadow-lg",
                  side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
                  side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
                  side === "top" && "inset-x-0 top-0 h-auto border-b",
                  side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
                  className
                )}
                {...props}
              >
                {children}
                <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-none opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
              </motion.div>
            </SheetPrimitive.Content>
          </>
        )}
      </AnimatePresence>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
