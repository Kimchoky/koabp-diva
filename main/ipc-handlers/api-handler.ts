import { ipcMain } from 'electron'
import axios, { Method } from 'axios'

// 실제 백엔드 서버의 주소
const API_BASE_URL = 'https://your-real-backend.com/api' // <-- 실제 백엔드 서버 주소로 변경하세요.

/**
 * API 관련 IPC 핸들러를 등록함
 * Renderer 프로세스로부터 HTTP 요청을 받아 실제 백엔드 서버로 전달(프록시)하고,
 * 그 응답을 다시 Renderer로 반환함
 */
export function registerApiHandlers() {
  ipcMain.handle(
    'http-request',
    async (event, args: { method: Method; path: string; data?: any; params?: any }) => {
      const { method, path, data, params } = args
      const url = `${API_BASE_URL}/${path}`

      try {
        const response = await axios({
          method,
          url,
          data,
          params,
          headers: {
            // 필요하다면 여기에 인증 토큰 등을 추가할 수 있습니다.
            // 'Authorization': `Bearer ${some_token}`
          },
        })
        return {
          success: true,
          data: response.data,
        }
      } catch (error) {
        console.error(`HTTP Request Failed: ${method} ${url}`, error.response?.data || error.message)
        return {
          success: false,
          error: error.response?.data || {
            message: error.message,
            code: error.code,
          },
        }
      }
    }
  )
}