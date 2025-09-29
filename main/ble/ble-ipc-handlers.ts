import { ipcMain } from 'electron'
import { BLEManager } from './ble-manager'

export function registerBLEHandlers(bleManager: BLEManager) {
  ipcMain.handle('ble-get-state', async () => {
    return bleManager.getState()
  })

  ipcMain.handle('ble-start-scan', async (event, filterServices, timeout) => {
    try {
      await bleManager.startScan(filterServices, timeout)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-stop-scan', async () => {
    try {
      await bleManager.stopScan()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-connect', async (event, deviceId) => {
    try {
      console.log('IPC: Attempting to connect to device:', deviceId)
      await bleManager.connect(deviceId)
      console.log('IPC: Successfully connected to device:', deviceId)
      return { success: true }
    } catch (error) {
      console.error('IPC: Connection failed:', error)
      return { success: false, error: error.message || 'Unknown connection error' }
    }
  })

  ipcMain.handle('ble-disconnect', async () => {
    try {
      await bleManager.disconnect()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-discover-services', async () => {
    try {
      const services = await bleManager.discoverServices()
      return { success: true, data: services }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-write-data', async (event, characteristicUuid, data) => {
    try {
      const buffer = Buffer.from(data)
      await bleManager.writeData(characteristicUuid, buffer)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-read-data', async (event, characteristicUuid) => {
    try {
      const data = await bleManager.readData(characteristicUuid)
      return { success: true, data: Array.from(data) }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-subscribe-notifications', async (event, characteristicUuid) => {
    try {
      await bleManager.subscribeToNotifications(characteristicUuid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-unsubscribe-notifications', async (event, characteristicUuid) => {
    try {
      await bleManager.unsubscribeFromNotifications(characteristicUuid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('ble-get-connected-device', async () => {
    return bleManager.getConnectedDevice()
  })

  ipcMain.handle('ble-is-device-connected', async () => {
    return bleManager.isDeviceConnected()
  })
}