import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args)
  },
}

const bleHandler = {
  getState: () => ipcRenderer.invoke('ble-get-state'),
  startScan: (timeout?: number) => ipcRenderer.invoke('ble-start-scan', timeout),
  stopScan: () => ipcRenderer.invoke('ble-stop-scan'),
  connect: (deviceId: string) => ipcRenderer.invoke('ble-connect', deviceId),
  disconnect: () => ipcRenderer.invoke('ble-disconnect'),
  discoverServices: () => ipcRenderer.invoke('ble-discover-services'),
  writeData: (characteristicUuid: string, data: number[]) =>
    ipcRenderer.invoke('ble-write-data', characteristicUuid, data),
  readData: (characteristicUuid: string) =>
    ipcRenderer.invoke('ble-read-data', characteristicUuid),
  subscribeNotifications: (characteristicUuid: string) =>
    ipcRenderer.invoke('ble-subscribe-notifications', characteristicUuid),
  unsubscribeNotifications: (characteristicUuid: string) =>
    ipcRenderer.invoke('ble-unsubscribe-notifications', characteristicUuid),
  getConnectedDevice: () => ipcRenderer.invoke('ble-get-connected-device'),
  isDeviceConnected: () => ipcRenderer.invoke('ble-is-device-connected'),

  onStateChange: (callback: (state: string) => void) => {
    const subscription = (_event: IpcRendererEvent, state: string) => callback(state)
    ipcRenderer.on('ble-state-change', subscription)
    return () => ipcRenderer.removeListener('ble-state-change', subscription)
  },

  onDeviceDiscovered: (callback: (device: any) => void) => {
    const subscription = (_event: IpcRendererEvent, device: any) => callback(device)
    ipcRenderer.on('ble-device-discovered', subscription)
    return () => ipcRenderer.removeListener('ble-device-discovered', subscription)
  },

  onScanStart: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on('ble-scan-start', subscription)
    return () => ipcRenderer.removeListener('ble-scan-start', subscription)
  },

  onScanStop: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on('ble-scan-stop', subscription)
    return () => ipcRenderer.removeListener('ble-scan-stop', subscription)
  },

  onDeviceConnected: (callback: (deviceId: string) => void) => {
    const subscription = (_event: IpcRendererEvent, deviceId: string) => callback(deviceId)
    ipcRenderer.on('ble-device-connected', subscription)
    return () => ipcRenderer.removeListener('ble-device-connected', subscription)
  },

  onDeviceDisconnected: (callback: (deviceId: string) => void) => {
    const subscription = (_event: IpcRendererEvent, deviceId: string) => callback(deviceId)
    ipcRenderer.on('ble-device-disconnected', subscription)
    return () => ipcRenderer.removeListener('ble-device-disconnected', subscription)
  },

  onDeviceDataParsed: (callback: (args: { characteristicUuid: string, parsedData: any }) => void) => {
    const subscription = (_event: IpcRendererEvent, args: { characteristicUuid: string, parsedData: any }) => {
      // console.log('--- PRELOAD: Received ble-device-data-parsed ---', args);
      callback(args)
    }
    ipcRenderer.on('ble-device-data-parsed', subscription)
    return () => ipcRenderer.removeListener('ble-device-data-parsed', subscription)
  },

  onDataWritten: (callback: (characteristicUuid: string, data: number[]) => void) => {
    const subscription = (_event: IpcRendererEvent, characteristicUuid: string, data: number[]) =>
      callback(characteristicUuid, data)
    ipcRenderer.on('ble-data-written', subscription)
    return () => ipcRenderer.removeListener('ble-data-written', subscription)
  },
}

contextBridge.exposeInMainWorld('ipc', handler)
contextBridge.exposeInMainWorld('ble', bleHandler)

export type IpcHandler = typeof handler
export type BleHandler = typeof bleHandler
