import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { BLEManager } from './ble-manager'
import { registerApiHandlers } from './ipc-handlers/api-handler'

const isProd = process.env.NODE_ENV === 'production'

// Handle N-API callback exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Don't exit the process for N-API callback exceptions as they're often recoverable
  if (!error.message?.includes('N-API callback exception')) {
    process.exit(1)
  }
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let bleManager: BLEManager

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1700,
    height: 1000,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Initialize BLE Manager
  bleManager = new BLEManager()

  // Register all IPC handlers
  registerApiHandlers()

  // Setup BLE event handlers after the window has finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    setupBLEEventHandlers(mainWindow)
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

// BLE Event Handlers
function setupBLEEventHandlers(mainWindow: any) {
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

// BLE IPC Handlers
ipcMain.handle('ble-get-state', async () => {
  return bleManager.getState()
})

ipcMain.handle('ble-start-scan', async (event, timeout) => {
  try {
    await bleManager.startScan(timeout)
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

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
