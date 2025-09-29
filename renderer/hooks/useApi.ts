import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { ApiError } from '../lib/api-config';

/**
 * HTTP 메서드 타입
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API 요청 옵션
 */
interface ApiRequestOptions {
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

/**
 * useQuery 옵션
 */
interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

/**
 * useMutation 옵션
 */
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
}

/**
 * API Hook 반환 타입
 */
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (path: string, options?: ApiRequestOptions) => Promise<T | void>;
  refetch?: () => Promise<void>;
  reset: () => void;
}

/**
 * Mutation Hook 반환 타입
 */
interface UseMutationReturn<TData, TVariables> {
  data: TData | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

/**
 * 범용 API 호출 Hook
 * GET, POST, PUT, DELETE, PATCH 모두 지원
 *
 * @example
 * const api = useApi<User>();
 *
 * // GET 요청
 * await api.execute('users/123', { method: 'GET' });
 *
 * // POST 요청
 * await api.execute('users', {
 *   method: 'POST',
 *   data: { name: 'John' }
 * });
 */
export function useApi<T = any>(options: ApiRequestOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (
    path: string,
    requestOptions: ApiRequestOptions = {}
  ): Promise<T | void> => {
    const mergedOptions = { ...options, ...requestOptions };
    const { method = 'GET', data: requestData, params, onSuccess, onError } = mergedOptions;

    setLoading(true);
    setError(null);

    try {
      let result: T;

      switch (method) {
        case 'GET':
          result = await apiClient.get<T>(path, params);
          break;
        case 'POST':
          result = await apiClient.post<T>(path, requestData);
          break;
        case 'PUT':
          result = await apiClient.put<T>(path, requestData);
          break;
        case 'DELETE':
          result = await apiClient.delete<T>(path);
          break;
        case 'PATCH':
          result = await apiClient.patch<T>(path, requestData);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.message || 'Unknown error',
        status: err?.status || 0,
        code: err?.code || 'API_ERROR',
        details: err
      };
      setError(apiError);
      onError?.(apiError);
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

/**
 * GET 요청 전용 Hook (자동 실행)
 * 컴포넌트 마운트 시 자동으로 데이터를 가져옵니다.
 *
 * @example
 * const { data, loading, error, refetch } = useQuery<User[]>('users', {
 *   enabled: true,
 *   refetchOnWindowFocus: true,
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 */
export function useQuery<T = any>(
  path: string,
  options: UseQueryOptions<T> & { params?: Record<string, any> } = {}
): UseApiReturn<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    params,
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
      const result = await apiClient.get<T>(path, params);
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.message || 'Unknown error',
        status: err?.status || 0,
        code: err?.code || 'QUERY_ERROR',
        details: err
      };
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [path, enabled, params, onSuccess, onError]);

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
    execute: async () => { await fetchData(); },
    refetch: fetchData,
    reset,
  };
}

/**
 * POST/PUT/DELETE 요청 전용 Hook (수동 실행)
 * mutate 함수를 호출하여 데이터를 변경합니다.
 *
 * @example
 * const { mutate, loading, error } = useMutation<User, CreateUserInput>(
 *   async (variables) => {
 *     return await apiClient.post('users', variables);
 *   },
 *   {
 *     onSuccess: (data) => console.log('User created:', data),
 *     onError: (error) => console.error('Error:', error)
 *   }
 * );
 *
 * // 사용
 * await mutate({ name: 'John', email: 'john@example.com' });
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result, variables);
      return result;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.message || 'Unknown error',
        status: err?.status || 0,
        code: err?.code || 'MUTATION_ERROR',
        details: err
      };
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