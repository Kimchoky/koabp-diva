import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

export interface BLEDevice {
  id: string
  name: string
  rssi: number
  advertisement: any
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
  devices: BLEDevice[]
  connectedDevice: string | null
  services: BLEService[]
  isConnected: boolean
}

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
  clearLogs: () => void
}

const BLEContext = createContext<BLEContextType | undefined>(undefined)

export function BLEProvider({ children }: { children: ReactNode }) {
  const [bleState, setBleState] = useState<BLEState>({
    state: 'unknown',
    isScanning: false,
    devices: [],
    connectedDevice: null,
    services: [],
    isConnected: false,
  })

  const [logs, setLogs] = useState<string[]>([])

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
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
        devices: [...prev.devices.filter(d => d.id !== device.id), device]
      }))
      addLog(`Device discovered: ${device.name} (${device.id})`)
    })
    unsubscribers.push(unsubDeviceDiscovered)

    // Scan start listener
    const unsubScanStart = window.ble.onScanStart(() => {
      setBleState(prev => ({ ...prev, isScanning: true, devices: [] }))
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
      setBleState(prev => ({ ...prev, connectedDevice: deviceId, isConnected: true }))
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
      addLog(`Disconnected from device: ${deviceId}`)
    })
    unsubscribers.push(unsubDeviceDisconnected)

    // Data received listener
    const unsubDataReceived = window.ble.onDataReceived((characteristicUuid: string, data: number[]) => {
      const dataStr = data.map(b => b.toString(16).padStart(2, '0')).join(' ')
      addLog(`Data received from ${characteristicUuid}: ${dataStr}`)
    })
    unsubscribers.push(unsubDataReceived)

    // Notification listener
    const unsubNotification = window.ble.onNotification((characteristicUuid: string, data: number[]) => {
      const dataStr = data.map(b => b.toString(16).padStart(2, '0')).join(' ')
      addLog(`Notification from ${characteristicUuid}: ${dataStr}`)
    })
    unsubscribers.push(unsubNotification)

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

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

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
    clearLogs,
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