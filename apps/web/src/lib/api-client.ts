/**
 * Centralized API Client with robust error handling
 *
 * Features:
 * - Typed ApiError class with status and helpers
 * - Automatic JSON parsing with fallback
 * - Configurable timeout (default 10s)
 * - Retry logic for transient failures
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ========================================
// Error Types
// ========================================

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }

  /** Network failure (offline, DNS, etc) */
  get isNetworkError() {
    return this.status === 0;
  }

  /** Server error (5xx) */
  get isServerError() {
    return this.status >= 500;
  }

  /** Client error (4xx) */
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /** Resource not found */
  get isNotFound() {
    return this.status === 404;
  }

  /** Authentication required */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Permission denied */
  get isForbidden() {
    return this.status === 403;
  }

  /** Validation error */
  get isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  /** Check if error is retryable */
  get isRetryable() {
    return this.isNetworkError || this.isServerError;
  }
}

// ========================================
// Request Options
// ========================================

export interface RequestOptions {
  /** Request headers */
  headers?: HeadersInit;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retries for transient failures (default: 0) */
  retries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Auth token to include */
  token?: string;
}

// ========================================
// Internal Helpers
// ========================================

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || data.error || `HTTP ${response.status}`;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========================================
// Core Request Function
// ========================================

async function request<T>(endpoint: string, options: RequestInit & RequestOptions = {}): Promise<T> {
  const { timeout = 10000, retries = 0, retryDelay = 1000, token, headers: customHeaders, ...fetchOptions } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let lastError: ApiError | null = null;
  let attempts = 0;

  while (attempts <= retries) {
    attempts++;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine external signal with timeout signal
    // Note: AbortSignal.any is not widely supported, so we fallback to timeout signal
    let signal = controller.signal;
    if (options.signal) {
      // If AbortSignal.any is available (modern browsers), use it
      if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
        signal = (AbortSignal as { any: (signals: AbortSignal[]) => AbortSignal }).any([options.signal, controller.signal]);
      } else {
        // Fallback: listen to external signal and abort our controller
        options.signal.addEventListener("abort", () => controller.abort());
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal,
        credentials: "include", // Include cookies for httpOnly auth
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        const error = new ApiError(response.status, errorMessage);

        // Only retry on server errors or network issues
        if (error.isRetryable && attempts <= retries) {
          lastError = error;
          await delay(retryDelay * attempts); // Exponential backoff
          continue;
        }

        throw error;
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse JSON response
      try {
        return await response.json();
      } catch {
        // If JSON parsing fails but response was OK, return empty object
        return {} as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        const timeoutError = new ApiError(0, "Request timed out");
        if (attempts <= retries) {
          lastError = timeoutError;
          await delay(retryDelay * attempts);
          continue;
        }
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError = new ApiError(0, "Network error. Please check your connection.");
        if (attempts <= retries) {
          lastError = networkError;
          await delay(retryDelay * attempts);
          continue;
        }
        throw networkError;
      }

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      throw new ApiError(0, error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  // If we exhausted retries, throw the last error
  throw lastError || new ApiError(0, "Request failed after retries");
}

// ========================================
// API Client Export
// ========================================

export const apiClient = {
  /**
   * Make a GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

// ========================================
// Utility Functions
// ========================================

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isNetworkError) {
      return "Unable to connect. Please check your internet connection.";
    }
    if (error.isServerError) {
      return "Something went wrong on our end. Please try again later.";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
