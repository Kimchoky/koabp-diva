export const API_CONFIG = {
  baseURL: process.env.EXPRESS_SERVER_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export type ApiResponse<T = any> = {
  data: T;
  message?: string;
  success: boolean;
};

export type ApiError = {
  message: string;
  status: number;
  code?: string;
};