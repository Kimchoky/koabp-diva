import { IpcHandler, BleHandler } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    ble: BleHandler
  }
}
