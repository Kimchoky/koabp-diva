import { IpcHandler, BleHandler, KeytarHandler } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    ble: BleHandler
    keytar: KeytarHandler
  }
}
