import { ApiResponse, ApiError } from './api-config';

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${path}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result: ApiResponse<T> | ApiError = await response.json();

    if (!response.ok) {
      throw result as ApiError;
    }

    return (result as ApiResponse<T>).data;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    return this.request<T>(`${path}${searchParams}`, {
      method: 'GET',
    });
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }

  setAuthToken(token: string) {
    this.baseUrl = '/api';
    return this;
  }
}

export const apiClient = new ApiClient();

export const queryFunctions = {
  getUsers: () => apiClient.get<User[]>('users'),
  getUser: (id: string) => apiClient.get<User>(`users/${id}`),
  createUser: (userData: Partial<User>) => apiClient.post<User>('users', userData),
  updateUser: (id: string, userData: Partial<User>) => apiClient.put<User>(`users/${id}`, userData),
  deleteUser: (id: string) => apiClient.delete<{ success: boolean }>(`users/${id}`),

  getProducts: (params?: { category?: string; limit?: number }) =>
    apiClient.get<Product[]>('products', params),
  getProduct: (id: string) => apiClient.get<Product>(`products/${id}`),

  getHealth: () => apiClient.get<{ status: string; timestamp: string }>('health'),
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  createdAt: string;
}