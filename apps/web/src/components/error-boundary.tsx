"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ui/error-fallback";

// ========================================
// Types
// ========================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Custom fallback render function */
  fallbackRender?: (props: { error: Error; reset: () => void }) => ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback when reset is triggered */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ========================================
// ErrorBoundary Component
// ========================================

/**
 * Error Boundary component to catch React rendering errors
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example with custom fallback
 * <ErrorBoundary
 *   fallbackRender={({ error, reset }) => (
 *     <div>
 *       <p>Something went wrong: {error.message}</p>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback render function
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <ErrorFallback
          variant="full"
          title="Something went wrong"
          description="An unexpected error occurred. Please try refreshing the page."
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ========================================
// Provider Component
// ========================================

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Convenience wrapper to add error boundary at app level
 */
export function ErrorBoundaryProvider({ children, onError }: ErrorBoundaryProviderProps) {
  return <ErrorBoundary onError={onError}>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
