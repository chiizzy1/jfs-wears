"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { AlertTriangle, Trash2, LogOut, X } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  icon?: "delete" | "logout" | "warning" | "none";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

/**
 * Hook to access the confirm dialog
 * Usage: const { confirm } = useConfirm();
 *        const ok = await confirm({ message: "Delete this item?" });
 *        if (ok) { // proceed with deletion }
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

/**
 * Provider component that enables the useConfirm hook
 * Wrap your app or admin layout with this provider
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  const getIcon = () => {
    switch (options?.icon) {
      case "delete":
        return <Trash2 className="w-5 h-5" />;
      case "logout":
        return <LogOut className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "none":
        return null;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getIconStyles = () => {
    switch (options?.variant) {
      case "danger":
        return "bg-red-50 text-red-600 border border-red-100";
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (options?.variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      default:
        return "bg-black hover:bg-gray-800 text-white";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleCancel} />

          {/* Dialog - Premium Editorial Style */}
          <div className="relative bg-white w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {/* Icon */}
              {options?.icon !== "none" && (
                <div className={`w-12 h-12 ${getIconStyles()} flex items-center justify-center mx-auto mb-6`}>{getIcon()}</div>
              )}

              {/* Title - Editorial uppercase tracking */}
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-center mb-3 text-primary">
                {options?.title || "Confirm Action"}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center text-sm leading-relaxed mb-8">{options?.message}</p>

              {/* Buttons - Premium style */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  {options?.cancelLabel || "Cancel"}
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all ${getConfirmButtonStyles()}`}
                  onClick={handleConfirm}
                >
                  {options?.confirmLabel || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Standalone confirmation dialog (for use without context)
 * Premium editorial design matching storefront aesthetics
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  icon?: "delete" | "logout" | "warning" | "none";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case "delete":
        return <Trash2 className="w-5 h-5" />;
      case "logout":
        return <LogOut className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "none":
        return null;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50 text-red-600 border border-red-100";
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      default:
        return "bg-black hover:bg-gray-800 text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Dialog - Premium Editorial Style */}
      <div className="relative bg-white w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* Icon */}
          {icon !== "none" && (
            <div className={`w-12 h-12 ${getIconStyles()} flex items-center justify-center mx-auto mb-6`}>{getIcon()}</div>
          )}

          {/* Title - Editorial uppercase tracking */}
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-center mb-3 text-primary">{title}</h3>

          {/* Message */}
          <p className="text-gray-600 text-center text-sm leading-relaxed mb-8">{message}</p>

          {/* Buttons - Premium style */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              className={`flex-1 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all ${getConfirmButtonStyles()}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
