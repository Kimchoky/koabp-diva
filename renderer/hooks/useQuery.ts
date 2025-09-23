import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, ApiError } from '../lib/api-config';

interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseQueryReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useQuery<T = any>(
  path: string,
  options: UseQueryOptions<T> = {}
): UseQueryReturn<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse<T> | ApiError = await response.json();

      if (!response.ok) {
        const errorResult = result as ApiError;
        setError(errorResult);
        onError?.(errorResult);
        return;
      }

      const successResult = result as ApiResponse<T>;
      setData(successResult.data);
      onSuccess?.(successResult.data);
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 0,
        code: 'NETWORK_ERROR'
      };
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [path, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!document.hidden && enabled) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData, enabled]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
  } = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const apiError: ApiError = err instanceof Error
        ? { message: err.message, status: 0, code: 'MUTATION_ERROR' }
        : err as ApiError;
      setError(apiError);
      options.onError?.(apiError, variables);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}