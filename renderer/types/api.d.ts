

export interface UserInfo {
  _id: string;
  email: string;
  name: string;
  lastLogin: Date;
  token?: string;
}





/**
 * BLE 디바이스 API 응답 타입
 */
interface BLEDeviceData {
  id: string;
  deviceName: string;
  deviceSerial: string
  deviceId: string;
  deviceType: DeviceType;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * BLE 디바이스 생성 요청 타입
 */
interface CreateBLEDeviceInput {
  deviceName: string;
  deviceSerial: string
  deviceId: string;
  deviceType: DeviceType;
  force?: boolean;
}

/**
 * BLE 디바이스 수정 요청 타입
 */
interface UpdateBLEDeviceInput {
  deviceName?: string;
  deviceSerial?: string
  deviceId?: string;
  deviceType?: DeviceType;
}

/**
 * BLE 디바이스 조회 필터 타입
 */
interface BLEDeviceFilter {
  deviceId?: string;
  deviceSerial?: string
  deviceName?: string;
  author?: string;
  deviceType?: DeviceType;
}
