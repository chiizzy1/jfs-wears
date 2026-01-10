/**
 * React Query wrapper hooks with consistent error handling
 *
 * Provides clean abstractions over useQuery/useMutation with:
 * - Typed ApiError handling
 * - Automatic toast notifications for mutations
 * - Loading/error/empty state helpers
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError, isApiError, getErrorMessage } from "@/lib/api-client";

// ========================================
// Types
// ========================================

export interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn"> {
  /** Show toast on error (default: false for queries) */
  showErrorToast?: boolean;
  /** Custom error message for toast */
  errorMessage?: string;
}

export interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn" | "onSuccess" | "onError"> {
  /** Show toast on success (default: true) */
  showSuccessToast?: boolean;
  /** Success message for toast */
  successMessage?: string;
  /** Show toast on error (default: true) */
  showErrorToast?: boolean;
  /** Custom error message for toast */
  errorMessage?: string;
  /** Query keys to invalidate on success */
  invalidateKeys?: unknown[][];
  /** Callback on success */
  onSuccess?: (data: TData) => void;
  /** Callback on error */
  onError?: (error: ApiError) => void;
}

export interface ApiQueryResult<TData> {
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

export interface ApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

// ========================================
// useApiQuery Hook
// ========================================

/**
 * Wrapper around useQuery with consistent error handling
 *
 * @example
 * const { data, isLoading, error, refetch } = useApiQuery(
 *   ["orders", orderId],
 *   () => apiClient.get<Order>(`/orders/${orderId}`),
 *   { enabled: !!orderId }
 * );
 */
export function useApiQuery<TData>(
  queryKey: unknown[],
  fetcher: () => Promise<TData>,
  options?: UseApiQueryOptions<TData>
): ApiQueryResult<TData> {
  const { showErrorToast = false, errorMessage, ...queryOptions } = options || {};

  const query = useQuery<TData, ApiError>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetcher();
      } catch (error) {
        // Ensure we always throw ApiError
        if (isApiError(error)) {
          throw error;
        }
        throw new ApiError(0, getErrorMessage(error));
      }
    },
    ...queryOptions,
  });

  // Show error toast if enabled
  if (query.isError && showErrorToast) {
    const message = errorMessage || getErrorMessage(query.error);
    toast.error(message);
  }

  // Determine if data is "empty" (null, undefined, or empty array)
  const isEmpty =
    query.isSuccess &&
    (query.data === null || query.data === undefined || (Array.isArray(query.data) && query.data.length === 0));

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isEmpty,
    refetch: query.refetch,
  };
}

// ========================================
// useApiMutation Hook
// ========================================

/**
 * Wrapper around useMutation with consistent error handling
 *
 * @example
 * const { mutate, isLoading } = useApiMutation(
 *   (data: CreateOrderDto) => apiClient.post<Order>("/orders", data),
 *   {
 *     successMessage: "Order created successfully",
 *     invalidateKeys: [["orders"]],
 *   }
 * );
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
): ApiMutationResult<TData, TVariables> {
  const queryClient = useQueryClient();

  const {
    showSuccessToast = true,
    successMessage,
    showErrorToast = true,
    errorMessage,
    invalidateKeys,
    onSuccess: customOnSuccess,
    onError: customOnError,
    ...mutationOptions
  } = options || {};

  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        if (isApiError(error)) {
          throw error;
        }
        throw new ApiError(0, getErrorMessage(error));
      }
    },
    onSuccess: (data, variables, context) => {
      // Show success toast
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      // Invalidate queries
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Call custom onSuccess
      customOnSuccess?.(data);
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showErrorToast) {
        const message = errorMessage || getErrorMessage(error);
        toast.error(message);
      }

      // Call custom onError
      customOnError?.(error);
    },
    ...mutationOptions,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// ========================================
// Utility Hooks
// ========================================

/**
 * Hook to handle async operations with loading/error state
 * For cases where you don't want to use React Query
 *
 * @example
 * const { execute, isLoading, error } = useAsyncAction(async (id: string) => {
 *   return await apiClient.delete(`/items/${id}`);
 * });
 */
export function useAsyncAction<TData, TArgs extends unknown[] = []>(
  action: (...args: TArgs) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiError) => void;
    showErrorToast?: boolean;
  }
) {
  const { onSuccess, onError, showErrorToast = true } = options || {};

  const [state, setState] = useState<{
    isLoading: boolean;
    error: ApiError | null;
    data: TData | undefined;
  }>({
    isLoading: false,
    error: null,
    data: undefined,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await action(...args);
        setState({ isLoading: false, error: null, data });
        onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = isApiError(error) ? error : new ApiError(0, getErrorMessage(error));
        setState({ isLoading: false, error: apiError, data: undefined });
        if (showErrorToast) {
          toast.error(getErrorMessage(apiError));
        }
        onError?.(apiError);
        throw apiError;
      }
    },
    [action, onSuccess, onError, showErrorToast]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: undefined });
  }, []);

  return { ...state, execute, reset };
}
