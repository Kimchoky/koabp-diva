export interface DeviceHistoryItem {
  id: string;
  name: string;
  lastConnected: Date;
  connectionCount: number;
  rssi?: number;
  advertisement?: any;
}

const STORAGE_KEY = 'ble_device_history';
const MAX_HISTORY_SIZE = 10; // 최대 10개의 기기 이력 보관

export class DeviceHistoryManager {
  private static instance: DeviceHistoryManager;

  static getInstance(): DeviceHistoryManager {
    if (!DeviceHistoryManager.instance) {
      DeviceHistoryManager.instance = new DeviceHistoryManager();
    }
    return DeviceHistoryManager.instance;
  }

  private constructor() {}

  /**
   * 최근 연결한 기기 목록을 가져옵니다
   */
  getRecentDevices(): DeviceHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const devices: DeviceHistoryItem[] = JSON.parse(stored);
      // Date 객체로 복원
      return devices.map(device => ({
        ...device,
        lastConnected: new Date(device.lastConnected)
      })).sort((a, b) => b.lastConnected.getTime() - a.lastConnected.getTime());
    } catch (error) {
      console.error('Failed to load device history:', error);
      return [];
    }
  }

  /**
   * 기기 연결 시 이력에 추가/업데이트합니다
   */
  addOrUpdateDevice(deviceId: string, deviceName: string, rssi?: number, advertisement?: any): void {
    try {
      const devices = this.getRecentDevices();
      const existingIndex = devices.findIndex(device => device.id === deviceId);

      if (existingIndex >= 0) {
        // 기존 기기 업데이트
        devices[existingIndex] = {
          ...devices[existingIndex],
          name: deviceName, // 이름이 변경될 수 있으므로 업데이트
          lastConnected: new Date(),
          connectionCount: devices[existingIndex].connectionCount + 1,
          rssi,
          advertisement
        };
      } else {
        // 새 기기 추가
        devices.unshift({
          id: deviceId,
          name: deviceName,
          lastConnected: new Date(),
          connectionCount: 1,
          rssi,
          advertisement
        });
      }

      // 최대 개수 제한
      const trimmedDevices = devices.slice(0, MAX_HISTORY_SIZE);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedDevices));
    } catch (error) {
      console.error('Failed to save device history:', error);
    }
  }

  /**
   * 특정 기기를 이력에서 제거합니다
   */
  removeDevice(deviceId: string): void {
    try {
      const devices = this.getRecentDevices();
      const filtered = devices.filter(device => device.id !== deviceId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove device from history:', error);
    }
  }

  /**
   * 모든 이력을 제거합니다
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear device history:', error);
    }
  }

  /**
   * 특정 기기의 이력 정보를 가져옵니다
   */
  getDeviceHistory(deviceId: string): DeviceHistoryItem | null {
    const devices = this.getRecentDevices();
    return devices.find(device => device.id === deviceId) || null;
  }
}