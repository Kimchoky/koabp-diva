import { useQuery, useMutation } from '../hooks/useQuery';
import { queryFunctions, User, Product } from './api-client';
import { ApiError } from './api-config';


export const checkDeviceNumberExists = (deviceNumber: string) => {

  //TODO: implement API
  // return useQuery(`device/${deviceNumber}`)

  return false;
}

export const getNextDeviceNumber = (deviceType: DeviceType): number => {
  // TODO: implement API
  return 5177;
}

export function useUsers() {
  return useQuery<User[]>('users');
}

export function useUser(id: string, enabled = true) {
  return useQuery<User>(`users/${id}`, { enabled });
}

export function useProducts(params?: { category?: string; limit?: number }) {
  const queryKey = params
    ? `products?${new URLSearchParams(params as Record<string, string>).toString()}`
    : 'products';

  return useQuery<Product[]>(queryKey);
}

export function useProduct(id: string, enabled = true) {
  return useQuery<Product>(`products/${id}`, { enabled });
}

export function useHealth() {
  return useQuery<{ status: string; timestamp: string }>('health', {
    refetchOnWindowFocus: true,
  });
}

export function useCreateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: ApiError) => void;
}) {
  return useMutation<User, Partial<User>>(
    (userData) => queryFunctions.createUser(userData),
    options
  );
}

export function useUpdateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: ApiError) => void;
}) {
  return useMutation<User, { id: string; data: Partial<User> }>(
    ({ id, data }) => queryFunctions.updateUser(id, data),
    options
  );
}

export function useDeleteUser(options?: {
  onSuccess?: (result: { success: boolean }) => void;
  onError?: (error: ApiError) => void;
}) {
  return useMutation<{ success: boolean }, string>(
    (id) => queryFunctions.deleteUser(id),
    options
  );
}