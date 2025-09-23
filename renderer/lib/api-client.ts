import { Method } from 'axios'

// Main 프로세스로부터 받을 응답 타입
interface IpcResponse<T> {
  success: boolean
  data?: T
  error?: any
}

/**
 * Electron의 Main 프로세스를 프록시로 사용하여 실제 백엔드 서버와 통신하는 API 클라이언트
 */
class ApiClient {
  private async request<T>(
    method: Method,
    path: string,
    data?: any,
    params?: any
  ): Promise<T> {
    // preload를 통해 노출된 ipc.invoke 함수를 호출하여 Main 프로세스에 HTTP 요청을 위임
    const response: IpcResponse<T> = await window.ipc.invoke('http-request', {
      method,
      path,
      data,
      params,
    })

    if (response.success) {
      return response.data as T
    } else {
      throw response.error
    }
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', path, undefined, params)
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('POST', path, data)
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PUT', path, data)
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', path, data)
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }
}

export const apiClient = new ApiClient()

// 이제 queryFunctions는 예전처럼 apiClient를 그대로 사용할 수 있습니다.
// 내부적으로는 IPC 통신을 통해 Main 프로세스가 모든 HTTP 요청을 처리합니다.
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
}

// 타입 정의는 그대로 유지합니다.
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  description?: string
  createdAt: string
}