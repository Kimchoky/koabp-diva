import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react'
import { UUID_CHARACTERISTIC_CUSTOM_TOTAL_NOTIFY_DATA } from '../lib/UUID'
import { createCommandSender } from '../lib/ble-commands';

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
  connectedDevice: string | null
  connectedDeviceInfo: BLEDevice | null
  services: BLEService[]
  isConnected: boolean
  lastParsedData: ParsedData | null // 파싱된 데이터를 저장할 상태
}

// commandSender를 포함하도록 컨텍스트 타입 업데이트
interface BLEContextType {
  bleState: BLEState
  logs: string[]
  startScan: (timeout?: number) => Promise<{ success: boolean; error?: string }>
  stopScan: () => Promise<{ success: boolean; error?: string }>
  connect: (deviceId: string) => Promise<{ success: boolean; error?: string }>
  disconnect: () => Promise<{ success: boolean; error?: string }>
  discoverServices: () => Promise<{ success: boolean; error?: string; data?: BLEService[] }>
  writeData: (characteristicUuid: string, data: number[]) => Promise<{ success: boolean; error?: string }>
  readData: (characteristicUuid: string) => Promise<{ success: boolean; error?: string; data?: number[] }>
  subscribeNotifications: (characteristicUuid: string) => Promise<{ success: boolean; error?: string }>
  unsubscribeNotifications: (characteristicUuid: string) => Promise<{ success: boolean; error?: string }>
  getConnectedDevice: () => Promise<{ success: boolean; error?: string }>
  clearLogs: () => void
  commandSender: ReturnType<typeof createCommandSender> | null
}

const BLEContext = createContext<BLEContextType | undefined>(undefined)

export function BLEProvider({ children }: { children: ReactNode }) {
  const [bleState, setBleState] = useState<BLEState>({
    state: 'unknown',
    isScanning: false,
    scannedDevices: [],
    connectedDevice: null,
    connectedDeviceInfo: null,
    services: [],
    isConnected: false,
    lastParsedData: null, // 초기값 설정
  })

  const [logs, setLogs] = useState<string[]>([])

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
    } catch (error) {
      addLog(`GetConnectedDevice failed: ${error}`)
      return { success: false, error: error.message }
    }
  }, [addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
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
      setBleState(prev => ({ ...prev, isScanning: true, scannedDevices: [] }))
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
      setBleState(prev => {
        // Find device info from scanned devices
        const deviceInfo = prev.scannedDevices.find(d => d.id === deviceId) || null;
        return {
          ...prev,
          connectedDevice: deviceId,
          connectedDeviceInfo: deviceInfo,
          isConnected: true,
          services: []
        }
      })
      addLog(`Connected to device: ${deviceId}`)
    })
    unsubscribers.push(unsubDeviceConnected)

    // Device disconnected listener
    const unsubDeviceDisconnected = window.ble.onDeviceDisconnected((deviceId: string) => {
      setBleState(prev => ({
        ...prev,
        connectedDevice: null,
        connectedDeviceInfo: null,
        isConnected: false,
        services: []
      }))
      addLog(`Disconnected from device: ${deviceId}`)
    })
    unsubscribers.push(unsubDeviceDisconnected)

    // Main 프로세스에서 파싱된 데이터를 받는 리스너
    const unsubDeviceDataParsed = window.ble.onDeviceDataParsed(({ characteristicUuid, parsedData }: { characteristicUuid: string, parsedData: ParsedData }) => {
      console.log(1111)

      // 배터리 잔량 업데이트 처리
      if (parsedData.type === 'batteryLevelUpdate' && bleState.connectedDevice) {
        const newBatteryLevel = parsedData.payload.batteryLevel;
        const currBatteryLevel = bleState.connectedDeviceInfo?.batteryLevel;

        console.log(newBatteryLevel, currBatteryLevel);

        if (newBatteryLevel !== currBatteryLevel) {
          addLog(`Updating battery level for ${bleState.connectedDevice} to ${newBatteryLevel}%`);
          setBleState(prev => ({
            ...prev,
            // 연결된 기기 정보에서 배터리 레벨 업데이트
            connectedDeviceInfo: prev.connectedDeviceInfo ?
              {...prev.connectedDeviceInfo, batteryLevel: newBatteryLevel} : null,
            // scanned devices에서도 같은 기기가 있다면 업데이트
            scannedDevices: prev.scannedDevices.map(device =>
              device.id === prev.connectedDevice
                ? {...device, batteryLevel: newBatteryLevel}
                : device
            ),
            lastParsedData: parsedData,
          }));
        }

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
    }
  }, [addLog])

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
    startScan,
    stopScan,
    connect,
    disconnect,
    discoverServices,
    writeData,
    readData,
    subscribeNotifications,
    unsubscribeNotifications,
    getConnectedDevice,
    clearLogs,
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