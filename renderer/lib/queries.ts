/**
 * API 쿼리 함수 모음
 * 직관적인 함수명으로 API를 호출합니다.
 */

import { apiClient } from './api-client';
import {BLEDeviceData, BLEDeviceFilter, CreateBLEDeviceInput, UpdateBLEDeviceInput, UserInfo} from "../types/api";

// ========================================
// BLE Devices API
// ========================================

/**
 *  BLE 디바이스 목록 조회
 * @param filter - 필터 옵션 (deviceName, author, deviceType)
 * @example
 * const devices = await getDevices({ deviceType: 'KB-1' });
 */
export const getDevices = async (filter?: BLEDeviceFilter): Promise<BLEDeviceData[]> => {
  return apiClient.get<BLEDeviceData[]>('devices', filter);
};

/**
 * 신규 BLE 디바이스 등록
 * @param deviceData - 디바이스 정보
 * @example
 * const device = await postDevice({
 *   deviceName: 'KOABP-KB1-5302',
 *   deviceId: 'abc123',
 *   deviceType: 'KB-1'
 * });
 */
export const postDevice = async (deviceData: CreateBLEDeviceInput): Promise<BLEDeviceData> => {
  return apiClient.post<BLEDeviceData>('devices', deviceData);
};

/**
 * BLE 디바이스 업데이트.
 * @param deviceData - 디바이스 정보
 * @example
 * const device = await postDevice({
 *   deviceName: 'KOABP-KB1-5302',
 *   deviceId: 'abc123',
 *   deviceType: 'KB-1'
 * });
 */
export const putDevice = async (filter: BLEDeviceFilter, deviceData: UpdateBLEDeviceInput): Promise<BLEDeviceData> => {
  return apiClient.put<BLEDeviceData>('devices', { filter, deviceData });
};

// ========================================
// Auth API
// ========================================

/**
 * API 키 유효성 검증
 * @param key - 검증할 API 키
 * @returns 유효하면 true, 아니면 false
 * @example
 * const isValid = await validateApiKey('your-api-key');
 */
export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    // 검증할 키를 헤더에 명시적으로 전달 (기본 API 키 대신)
    await apiClient.get<{ message: string }>('auth/check-key', undefined, {
      'X-API-KEY': key,
    });
    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

/**
 * User 목록 조회
 * @returns UserInfo[]
 */
export const getUsers = async (): Promise<UserInfo[]> => {
  return apiClient.get<UserInfo[]>('users')
};

/**
 * Login
 * @param email
 * @param password
 */
export const postLogin = async (email: string, password: string): Promise<UserInfo> => {
  return apiClient.post<UserInfo>('auth/login', { email, password });
}

export const getMe = async (): Promise<UserInfo> => {
  return apiClient.get<UserInfo>('auth/me');
}

export const getNextDeviceSerial = async (deviceType: DeviceType): Promise<{ nextDeviceSerial: string }> => {
  return apiClient.get<{nextDeviceSerial: string}>(`device-serial/next/${deviceType}`)
}