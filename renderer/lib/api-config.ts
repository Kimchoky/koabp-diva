/**
 * API 설정 관리
 * Main 프로세스의 IPC를 통해 외부 API 서버와 통신합니다.
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // 추가 공통 헤더 (필요시 여기에 추가)
    // 'Authorization': 'Bearer token',
    // 'X-API-Key': 'your-api-key',
  },
} as const;

/**
 * API 설정을 런타임에 업데이트합니다.
 */
export const updateApiConfig = (config: Partial<typeof API_CONFIG>) => {
  Object.assign(API_CONFIG, config);
};

/**
 * API 응답 타입
 */
export type ApiResponse<T = any> = {
  data: T;
  message?: string;
  success: boolean;
};

/**
 * API 에러 타입
 */
export type ApiError = {
  message: string;
  status: number;
  code?: string;
  details?: any;
};