import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { BLEManager } from './ble/ble-manager'
import { registerApiHandlers } from './ipc-handlers/api-handler'
import { setupBLEEventHandlers } from './ble/ble-events'
import { registerBLEHandlers } from './ble/ble-ipc-handlers'

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
    minWidth: 1120,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'resources/icon.png'),
  })

  // Initialize BLE Manager
  bleManager = new BLEManager()

  // Register all IPC handlers
  registerApiHandlers()
  registerBLEHandlers(bleManager)

  // Setup BLE event handlers after the window has finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    setupBLEEventHandlers(bleManager, mainWindow)
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

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
