import { cn } from "@/lib/utils";

// ========================================
// Types
// ========================================

export interface ErrorFallbackProps {
  /** Visual variant */
  variant?: "full" | "card" | "inline";
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Show home link */
  showHomeLink?: boolean;
  /** Additional class names */
  className?: string;
}

// ========================================
// Icons
// ========================================

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

// ========================================
// ErrorFallback Component
// ========================================

/**
 * Reusable error fallback UI component
 *
 * @example Full page error
 * <ErrorFallback
 *   variant="full"
 *   title="Page not found"
 *   description="The page you're looking for doesn't exist."
 *   showHomeLink
 * />
 *
 * @example Card error with retry
 * <ErrorFallback
 *   variant="card"
 *   title="Failed to load orders"
 *   onRetry={() => refetch()}
 * />
 *
 * @example Inline error
 * <ErrorFallback
 *   variant="inline"
 *   description="Failed to load data"
 *   onRetry={refetch}
 * />
 */
export function ErrorFallback({
  variant = "card",
  title = "Something went wrong",
  description = "An error occurred. Please try again.",
  onRetry,
  retryText = "Try again",
  showHomeLink = false,
  className,
}: ErrorFallbackProps) {
  // ========================================
  // Full Page Variant
  // ========================================
  if (variant === "full") {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-secondary px-4", className)}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircleIcon className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
              >
                <RefreshIcon className="w-4 h-4" />
                {retryText}
              </button>
            )}
            {showHomeLink && (
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Go to Home
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // Card Variant
  // ========================================
  if (variant === "card") {
    return (
      <div className={cn("bg-white p-6 shadow-sm border border-gray-100", className)}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6 text-error" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              <RefreshIcon className="w-4 h-4" />
              {retryText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // Inline Variant
  // ========================================
  return (
    <div className={cn("flex items-center gap-3 p-4 bg-error/10 text-error", className)}>
      <AlertCircleIcon className="w-5 h-5 shrink-0" />
      <p className="text-sm flex-1">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 p-1.5 hover:bg-error/20 transition-colors" title={retryText}>
          <RefreshIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ========================================
// Empty State Component
// ========================================

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for when there's no data
 */
export function EmptyState({
  title = "No data",
  description = "There's nothing here yet.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 text-sm bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
