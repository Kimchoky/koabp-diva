import { BrowserWindow } from 'electron'
import {BLEManager} from "./ble-manager";

export function setupBLEEventHandlers(bleManager: BLEManager, mainWindow: BrowserWindow) {
  bleManager.on('stateChange', (state) => {
    mainWindow.webContents.send('ble-state-change', state)
  })

  bleManager.on('deviceDiscovered', (device) => {
    mainWindow.webContents.send('ble-device-discovered', device)
  })

  bleManager.on('scanStart', () => {
    mainWindow.webContents.send('ble-scan-start')
  })

  bleManager.on('scanStop', () => {
    mainWindow.webContents.send('ble-scan-stop')
  })

  bleManager.on('deviceConnected', (deviceId) => {
    mainWindow.webContents.send('ble-device-connected', deviceId)
  })

  bleManager.on('deviceDisconnected', (deviceId) => {
    mainWindow.webContents.send('ble-device-disconnected', deviceId)
  })

  bleManager.on('deviceDataParsed', ({ characteristicUuid, parsedData }) => {
    console.log('--- BACKGROUND: Forwarding deviceDataParsed to renderer ---', parsedData);
    mainWindow.webContents.send('ble-device-data-parsed', { characteristicUuid, parsedData })
  })

  bleManager.on('dataWritten', (characteristicUuid, data) => {
    mainWindow.webContents.send('ble-data-written', characteristicUuid, Array.from(data))
  })
}