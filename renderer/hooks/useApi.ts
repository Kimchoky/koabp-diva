import { useState, useCallback } from 'react';
import { ApiResponse, ApiError } from '../lib/api-config';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (path: string, options?: RequestInit) => Promise<void>;
  reset: () => void;
}

export function useApi<T = any>(options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (path: string, requestOptions: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...requestOptions,
      });

      const result: ApiResponse<T> | ApiError = await response.json();

      if (!response.ok) {
        const errorResult = result as ApiError;
        setError(errorResult);
        options.onError?.(errorResult);
        return;
      }

      const successResult = result as ApiResponse<T>;
      setData(successResult.data);
      options.onSuccess?.(successResult.data);
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 0,
        code: 'NETWORK_ERROR'
      };
      setError(apiError);
      options.onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export function useApiMutation<T = any>(options: UseApiOptions = {}): UseApiReturn<T> {
  return useApi<T>(options);
}

export function useApiQuery<T = any>(
  path: string,
  requestOptions?: RequestInit,
  options: UseApiOptions & { enabled?: boolean } = {}
): UseApiReturn<T> {
  const { enabled = true, ...apiOptions } = options;
  const api = useApi<T>(apiOptions);

  useState(() => {
    if (enabled) {
      api.execute(path, requestOptions);
    }
  });

  return api;
}