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
    params?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    // API 키 가져오기
    const apiKey = await window.keytar.getApiKey();

    // 기본 헤더에 API 키 추가
    const mergedHeaders = {
      ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...headers,
    };

    // preload를 통해 노출된 ipc.invoke 함수를 호출하여 Main 프로세스에 HTTP 요청을 위임
    const response: IpcResponse<T> = await window.ipc.invoke('http-request', {
      method,
      path,
      data,
      params,
      headers: mergedHeaders,
    })

    if (response.success) {
      return response.data as T
    } else {
      throw response.error
    }
  }

  async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, params, headers)
  }

  async post<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, data, undefined, headers)
  }

  async put<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, data, undefined, headers)
  }

  async patch<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, data, undefined, headers)
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, undefined, headers)
  }
}

export const apiClient = new ApiClient()