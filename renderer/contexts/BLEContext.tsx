import React, {createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo, useRef} from 'react'
import { UUID_CHARACTERISTIC_CUSTOM_TOTAL_NOTIFY_DATA } from '../lib/UUID'
import { createCommandSender } from '../lib/ble-commands'
import { DeviceHistoryManager, DeviceHistoryItem } from '../lib/deviceHistory';

// 파서가 Main 프로세스로 이동했으므로, 여기서 ParsedData 타입만 import 하거나 직접 정의합니다.
export interface ParsedData {
  type: string;
  payload: any;
}

export interface BLEDevice {
  /**
   * 블루투스 모듈의 고유 식별자.
   * macOS에서는 OS가 할당하는 UUID이며, 다른 OS에서는 주로 MAC 주소입니다.
   */
  id: string
  name: string
  rssi: number
  advertisement: any
  batteryLevel?: number
}

export interface BLECharacteristic {
  uuid: string
  properties: string[]
}

export interface BLEService {
  uuid: string
  characteristics: BLECharacteristic[]
}

export interface BLEState {
  state: string
  isScanning: boolean
  scannedDevices: BLEDevice[]
  connectedDevice: BLEDevice | null
  services: BLEService[]
  isConnected: boolean
  lastParsedData: ParsedData | null // 파싱된 데이터를 저장할 상태
  communicationHealthy: boolean // 실제 데이터 통신이 가능한지 여부
  lastBatteryDataTime: Date | null // 마지막 배터리 데이터 수신 시간
}

export type BleResultType = { success: boolean; error?: string }

// commandSender를 포함하도록 컨텍스트 타입 업데이트
interface BLEContextType {
  bleState: BLEState
  logs: string[]
  recentDevices: DeviceHistoryItem[]
  startScan: (timeout?: number) => Promise<BleResultType>
  stopScan: () => Promise<BleResultType>
  connect: (deviceId: string) => Promise<BleResultType>
  connectToRecentDevice: (deviceId: string) => Promise<BleResultType>
  disconnect: () => Promise<BleResultType>
  discoverServices: () => Promise<{ success: boolean; error?: string; data?: BLEService[] }>
  writeData: (characteristicUuid: string, data: number[]) => Promise<BleResultType>
  readData: (characteristicUuid: string) => Promise<{ success: boolean; error?: string; data?: number[] }>
  getConnectedDevice: (deviceId: string) => Promise<BLEDevice | null>
  subscribeNotifications: (characteristicUuid: string) => Promise<BleResultType>
  unsubscribeNotifications: (characteristicUuid: string) => Promise<BleResultType>
  clearLogs: () => void
  removeDeviceFromHistory: (deviceId: string) => void
  clearDeviceHistory: () => void
  commandSender: ReturnType<typeof createCommandSender> | null
}

const BLEContext = createContext<BLEContextType | undefined>(undefined)

export function BLEProvider({ children }: { children: ReactNode }) {
  const [bleState, setBleState] = useState<BLEState>({
    state: 'unknown',
    isScanning: false,
    scannedDevices: [],
    connectedDevice: null,
    services: [],
    isConnected: false,
    lastParsedData: null, // 초기값 설정
    communicationHealthy: false, // 초기값: 통신 불가능 상태
    lastBatteryDataTime: null, // 초기값: 배터리 데이터 수신 시간 없음
  })

  const [logs, setLogs] = useState<string[]>([])
  const [recentDevices, setRecentDevices] = useState<DeviceHistoryItem[]>([])
  const deviceHistoryManager = useMemo(() => DeviceHistoryManager.getInstance(), [])

  // 배터리 데이터 타임아웃 체크용 타이머
  const batteryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const BATTERY_TIMEOUT_MS = 5000 // 5초 타임아웃

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  const startScan = useCallback(async (timeout?: number) => {
    try {
      const result = await window.ble.startScan(timeout)
      if (!result.success) {
        addLog(`Scan failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Scan error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const stopScan = useCallback(async () => {
    try {
      const result = await window.ble.stopScan()
      if (!result.success) {
        addLog(`Stop scan failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Stop scan error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const connect = useCallback(async (deviceId: string) => {
    try {
      const result = await window.ble.connect(deviceId)
      if (!result.success) {
        addLog(`Connection failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Connection error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const disconnect = useCallback(async () => {
    try {
      const result = await window.ble.disconnect()
      if (!result.success) {
        addLog(`Disconnection failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Disconnection error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const discoverServices = useCallback(async () => {
    try {
      const result = await window.ble.discoverServices()
      if (result.success) {
        setBleState(prev => ({ ...prev, services: result.data }))
        addLog(`Discovered ${result.data.length} services`)
      } else {
        addLog(`Service discovery failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Service discovery error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const writeData = useCallback(async (characteristicUuid: string, data: number[]) => {
    try {
      const result = await window.ble.writeData(characteristicUuid, data)
      if (!result.success) {
        addLog(`Write failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Write error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const readData = useCallback(async (characteristicUuid: string) => {
    try {
      const result = await window.ble.readData(characteristicUuid)
      if (!result.success) {
        addLog(`Read failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Read error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const subscribeNotifications = useCallback(async (characteristicUuid: string) => {
    try {
      const result = await window.ble.subscribeNotifications(characteristicUuid)
      if (result.success) {
        addLog(`Subscribed to notifications: ${characteristicUuid}`)
      } else {
        addLog(`Subscribe failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Subscribe error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const unsubscribeNotifications = useCallback(async (characteristicUuid: string) => {
    try {
      const result = await window.ble.unsubscribeNotifications(characteristicUuid)
      if (result.success) {
        addLog(`Unsubscribed from notifications: ${characteristicUuid}`)
      } else {
        addLog(`Unsubscribe failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Unsubscribe error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const getConnectedDevice = useCallback(async () => {
    try {
      const result = await window.ble.getConnectedDevice()
      addLog(`Connected device: ${result}`)
      console.log(`getConnectedDevice`, result)
      return result
    } catch (error) {
      addLog(`GetConnectedDevice failed: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // 최근 기기 목록 새로고침
  const refreshRecentDevices = useCallback(() => {
    setRecentDevices(deviceHistoryManager.getRecentDevices())
  }, [deviceHistoryManager])

  // 기기 이력에서 제거
  const removeDeviceFromHistory = useCallback((deviceId: string) => {
    deviceHistoryManager.removeDevice(deviceId)
    refreshRecentDevices()
    addLog(`Device removed from history: ${deviceId}`)
  }, [deviceHistoryManager, refreshRecentDevices, addLog])

  // 최근 연결한 기기로 직접 연결 (스캔 없이)
  const connectToRecentDevice = useCallback(async (deviceId: string) => {
    try {
      addLog(`Attempting to connect to recent device: ${deviceId}`)
      const result = await window.ble.connect(deviceId)
      if (!result.success) {
        addLog(`Direct connection failed: ${result.error}`)
      }
      return result
    } catch (error) {
      addLog(`Direct connection error: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  // 모든 기기 이력 제거
  const clearDeviceHistory = useCallback(() => {
    deviceHistoryManager.clearHistory()
    refreshRecentDevices()
    addLog('Device history cleared')
  }, [deviceHistoryManager, refreshRecentDevices, addLog])

  // 배터리 데이터 타임아웃 타이머 시작
  const startBatteryTimeout = useCallback(() => {
    // 기존 타이머 정리
    if (batteryTimeoutRef.current) {
      clearTimeout(batteryTimeoutRef.current)
    }

    batteryTimeoutRef.current = setTimeout(() => {
      setBleState(prev => {
        if (prev.isConnected && prev.communicationHealthy) {
          addLog('Battery data timeout - communication may be unhealthy')
          return {
            ...prev,
            communicationHealthy: false
          }
        }
        return prev
      })
    }, BATTERY_TIMEOUT_MS)
  }, [addLog, BATTERY_TIMEOUT_MS])

  // 배터리 데이터 수신 시 호출 - 통신 상태를 건강함으로 표시
  const onBatteryDataReceived = useCallback((parsedData: ParsedData) => {

    const now = new Date()

    const newState = {}

    setBleState(prev => {
      if (!prev.connectedDevice) {
        return { ...prev, lastParsedData: parsedData };
      }
      // 배터리 업데이트
      const currBatteryLevel = prev.connectedDevice.batteryLevel;
      const newBatteryLevel = parsedData.payload.batteryLevel;
      if (!currBatteryLevel || (newBatteryLevel !== currBatteryLevel)) {
        // 연결된 기기 정보에서 배터리 레벨 업데이트
        newState.connectedDevice = {
          ...prev.connectedDevice,
          batteryLevel: newBatteryLevel
        };
        addLog(`Updating battery level for ${prev.connectedDevice.name} to ${newBatteryLevel}%`);
      }

      return {
        ...prev,
        ...newState,
        // healthCheck
        communicationHealthy: true,
        lastBatteryDataTime: now,
        // lastParsedData: parsedData,
      }
    })

    // 다음 타임아웃 타이머 시작
    startBatteryTimeout()

  }, [startBatteryTimeout])

  // 연결 해제 시 타이머 정리
  const cleanupBatteryTimeout = useCallback(() => {
    if (batteryTimeoutRef.current) {
      clearTimeout(batteryTimeoutRef.current)
      batteryTimeoutRef.current = null
    }
    setBleState(prev => ({
      ...prev,
      communicationHealthy: false,
      lastBatteryDataTime: null
    }))
  }, [])



  useEffect(() => {
    if (!window.ble) return

    const unsubscribers: (() => void)[] = []

    // State change listener
    const unsubStateChange = window.ble.onStateChange((state: string) => {
      setBleState(prev => ({ ...prev, state }))
      addLog(`BLE state changed: ${state}`)
    })
    unsubscribers.push(unsubStateChange)

    // Device discovered listener
    const unsubDeviceDiscovered = window.ble.onDeviceDiscovered((device: BLEDevice) => {
      setBleState(prev => ({
        ...prev,
        scannedDevices: [...prev.scannedDevices.filter(d => d.id !== device.id), device]
      }))
      addLog(`Device discovered: ${device.name} (${device.id})`)
    })
    unsubscribers.push(unsubDeviceDiscovered)

    // Scan start listener
    const unsubScanStart = window.ble.onScanStart(() => {
      setBleState(prev => ({
        ...prev,
        isScanning: true,
        // scannedDevices: prev.connectedDevice ? [prev.connectedDevice] : [],  // 스캔목록에 현재 접속기기도 나타나게 함
        scannedDevices: [],
      }))
      addLog('Scan started')
    })
    unsubscribers.push(unsubScanStart)

    // Scan stop listener
    const unsubScanStop = window.ble.onScanStop(() => {
      setBleState(prev => ({ ...prev, isScanning: false }))
      addLog('Scan stopped')
    })
    unsubscribers.push(unsubScanStop)

    // Device connected listener
    const unsubDeviceConnected = window.ble.onDeviceConnected((deviceId: string) => {
      console.log('Device connected event received:', deviceId);
      setBleState(prev => {
        console.log('Current scanned devices:', prev.scannedDevices.map(d => d.id));
        // Find device info from scanned devices
        const deviceInfo = prev.scannedDevices.find(d => d.id === deviceId);
        let connectedDevice: BLEDevice;

        if (deviceInfo) {
          console.log('Found device info:', deviceInfo);
          connectedDevice = {...deviceInfo};
        } else {
          console.log('Device not found in scanned devices, checking history');
          // 스캔된 기기 목록에 없는 경우 이력에서 찾기
          const historyItem = deviceHistoryManager.getDeviceHistory(deviceId);
          if (historyItem) {
            connectedDevice = {
              id: historyItem.id,
              name: historyItem.name,
              rssi: historyItem.rssi || 0,
              advertisement: historyItem.advertisement,
              batteryLevel: undefined
            };
          } else {
            // 이력에도 없는 경우 기본 정보로 생성
            connectedDevice = {
              id: deviceId,
              name: 'Unknown Device',
              rssi: 0,
              advertisement: null,
              batteryLevel: undefined
            };
          }
        }

        // 기기 이력에 추가/업데이트
        deviceHistoryManager.addOrUpdateDevice(
          connectedDevice.id,
          connectedDevice.name,
          connectedDevice.rssi,
          connectedDevice.advertisement
        );

        const newState = {
          ...prev,
          connectedDevice,
          isConnected: true,
          services: []
        };
        console.log('Setting new connected device:', newState.connectedDevice);
        return newState;
      })

      // 이력 목록 새로고침
      refreshRecentDevices();

      // 배터리 데이터 타임아웃 타이머 시작 (연결 후 곧 배터리 데이터가 와야 함)
      startBatteryTimeout();

      addLog(`Connected to device: ${deviceId}`)
    })
    unsubscribers.push(unsubDeviceConnected)

    // Device disconnected listener
    const unsubDeviceDisconnected = window.ble.onDeviceDisconnected((deviceId: string) => {
      setBleState(prev => ({
        ...prev,
        connectedDevice: null,
        isConnected: false,
        services: []
      }))

      // 배터리 데이터 타임아웃 타이머 정리
      cleanupBatteryTimeout();

      addLog(`Disconnected from device: ${deviceId}`)
    })
    unsubscribers.push(unsubDeviceDisconnected)

    // Main 프로세스에서 파싱된 데이터를 받는 리스너
    const unsubDeviceDataParsed = window.ble.onDeviceDataParsed(({ characteristicUuid, parsedData }: { characteristicUuid: string, parsedData: ParsedData }) => {

      if (parsedData.type === 'firmwareStatus') {
        // 배터리 데이터 수신 = 통신 상태 양호
        // 배터리 잔량 업데이트 처리
        onBatteryDataReceived(parsedData);

      } else {
        // 다른 종류의 데이터는 lastParsedData에만 저장
        setBleState(prev => ({ ...prev, lastParsedData: parsedData }));
      }
    });
    unsubscribers.push(unsubDeviceDataParsed);


    // Data written listener
    const unsubDataWritten = window.ble.onDataWritten((characteristicUuid: string, data: number[]) => {
      const dataStr = data.map(b => b.toString(16).padStart(2, '0')).join(' ')
      addLog(`Data written to ${characteristicUuid}: ${dataStr}`)
    })
    unsubscribers.push(unsubDataWritten)

    // Initialize state
    window.ble.getState().then((state: string) => {
      setBleState(prev => ({ ...prev, state }))
    })

    return () => {
      unsubscribers.forEach(unsub => unsub())
      // 컴포넌트 언마운트 시 배터리 타이머 정리
      if (batteryTimeoutRef.current) {
        clearTimeout(batteryTimeoutRef.current)
      }
    }
  }, [addLog, deviceHistoryManager, refreshRecentDevices, startBatteryTimeout, onBatteryDataReceived, cleanupBatteryTimeout])

  // 최근 기기 목록 초기 로드
  useEffect(() => {
    refreshRecentDevices()
  }, [refreshRecentDevices])

  // Auto discover services on connect
  useEffect(() => {
    // 1. When connection is established, discover services
    if (bleState.isConnected && bleState.connectedDevice && bleState.services.length === 0) {
      addLog('Device connected. Discovering services...');
      discoverServices();
    }
  }, [bleState.isConnected, bleState.connectedDevice, bleState.services.length, discoverServices, addLog]);

  // Auto subscribe to notifications when services are discovered
  useEffect(() => {
    if (bleState.services.length > 0) {
      addLog('Services discovered. Checking for notification characteristic...');
      let found = false;
      for (const service of bleState.services) {
        for (const char of service.characteristics) {
          if (char.uuid === UUID_CHARACTERISTIC_CUSTOM_TOTAL_NOTIFY_DATA) {
            found = true;
            addLog(`Found notification characteristic: ${char.uuid}. Subscribing...`);
            subscribeNotifications(char.uuid);
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        addLog('Target notification characteristic not found.');

      }
    }
  }, [bleState.services, subscribeNotifications, addLog]);

  // 커맨드 전송 객체 생성
  const commandSender = useMemo(() => {
      return createCommandSender(writeData, addLog);
  }, [writeData, addLog]);

  const value: BLEContextType = {
    bleState,
    logs,
    recentDevices,
    startScan,
    stopScan,
    connect,
    connectToRecentDevice,
    disconnect,
    discoverServices,
    writeData,
    readData,
    getConnectedDevice,
    subscribeNotifications,
    unsubscribeNotifications,
    clearLogs,
    removeDeviceFromHistory,
    clearDeviceHistory,
    commandSender, // 컨텍스트 value에 추가
  }

  return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>
}

export function useBLE() {
  const context = useContext(BLEContext)
  if (context === undefined) {
    throw new Error('useBLE must be used within a BLEProvider')
  }
  return context
}