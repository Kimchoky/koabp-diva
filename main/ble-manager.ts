import noble from '@abandonware/noble'
import { EventEmitter } from 'events'

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

export class BLEManager extends EventEmitter {
  private connectedDevice: any = null
  private connectedCharacteristics: Map<string, any> = new Map()
  private isScanning = false

  constructor() {
    super()
    this.setupNobleListeners()
  }

  private setupNobleListeners() {
    noble.on('stateChange', (state) => {
      console.log('BLE state changed:', state)
      this.emit('stateChange', state)

      if (state === 'poweredOn') {
        console.log('BLE is powered on and ready')
      } else {
        console.log('BLE is not available:', state)
        if (this.isScanning) {
          this.stopScan()
        }
      }
    })

    noble.on('discover', (peripheral) => {
      const device: BLEDevice = {
        id: peripheral.id,
        name: peripheral.advertisement.localName || 'Unknown Device',
        rssi: peripheral.rssi,
        advertisement: peripheral.advertisement
      }

      console.log('Discovered device:', device.name, device.id)
      this.emit('deviceDiscovered', device)
    })

    noble.on('scanStart', () => {
      console.log('Scan started')
      this.isScanning = true
      this.emit('scanStart')
    })

    noble.on('scanStop', () => {
      console.log('Scan stopped')
      this.isScanning = false
      this.emit('scanStop')
    })
  }

  async startScan(timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (noble.state !== 'poweredOn') {
        reject(new Error('BLE is not powered on'))
        return
      }

      console.log('Starting BLE scan...')
      noble.startScanning([], false)

      if (timeout) {
        setTimeout(() => {
          this.stopScan()
        }, timeout)
      }

      resolve()
    })
  }

  async stopScan(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Stopping BLE scan...')
      noble.stopScanning()
      resolve()
    })
  }

  async connect(deviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectedDevice) {
        reject(new Error('Already connected to a device'))
        return
      }

      const peripheral = noble._peripherals[deviceId]
      if (!peripheral) {
        reject(new Error('Device not found'))
        return
      }

      console.log('Connecting to device:', deviceId)

      peripheral.connect((error: any) => {
        if (error) {
          console.error('Connection failed:', error)
          reject(error)
          return
        }

        this.connectedDevice = peripheral
        console.log('Connected to device:', deviceId)
        this.emit('deviceConnected', deviceId)

        peripheral.on('disconnect', () => {
          console.log('Device disconnected:', deviceId)
          this.connectedDevice = null
          this.connectedCharacteristics.clear()
          this.emit('deviceDisconnected', deviceId)
        })

        resolve()
      })
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connectedDevice) {
        reject(new Error('No device connected'))
        return
      }

      console.log('Disconnecting from device...')
      this.connectedDevice.disconnect((error: any) => {
        if (error) {
          console.error('Disconnection failed:', error)
          reject(error)
          return
        }
        resolve()
      })
    })
  }

  async discoverServices(): Promise<BLEService[]> {
    return new Promise((resolve, reject) => {
      if (!this.connectedDevice) {
        reject(new Error('No device connected'))
        return
      }

      console.log('Discovering services...')
      this.connectedDevice.discoverServices([], (error: any, services: any[]) => {
        if (error) {
          console.error('Service discovery failed:', error)
          reject(error)
          return
        }

        const servicePromises = services.map(service =>
          new Promise<BLEService>((resolveService, rejectService) => {
            service.discoverCharacteristics([], (charError: any, characteristics: any[]) => {
              if (charError) {
                rejectService(charError)
                return
              }

              characteristics.forEach(char => {
                this.connectedCharacteristics.set(char.uuid, char)
              })

              const bleService: BLEService = {
                uuid: service.uuid,
                characteristics: characteristics.map(char => ({
                  uuid: char.uuid,
                  properties: char.properties
                }))
              }

              resolveService(bleService)
            })
          })
        )

        Promise.all(servicePromises)
          .then(resolve)
          .catch(reject)
      })
    })
  }

  async writeData(characteristicUuid: string, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const characteristic = this.connectedCharacteristics.get(characteristicUuid)
      if (!characteristic) {
        reject(new Error('Characteristic not found'))
        return
      }

      console.log('Writing data to characteristic:', characteristicUuid)
      characteristic.write(data, false, (error: any) => {
        if (error) {
          console.error('Write failed:', error)
          reject(error)
          return
        }

        console.log('Data written successfully')
        this.emit('dataWritten', characteristicUuid, data)
        resolve()
      })
    })
  }

  async readData(characteristicUuid: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const characteristic = this.connectedCharacteristics.get(characteristicUuid)
      if (!characteristic) {
        reject(new Error('Characteristic not found'))
        return
      }

      console.log('Reading data from characteristic:', characteristicUuid)
      characteristic.read((error: any, data: Buffer) => {
        if (error) {
          console.error('Read failed:', error)
          reject(error)
          return
        }

        console.log('Data read successfully:', data)
        this.emit('dataReceived', characteristicUuid, data)
        resolve(data)
      })
    })
  }

  async subscribeToNotifications(characteristicUuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const characteristic = this.connectedCharacteristics.get(characteristicUuid)
      if (!characteristic) {
        reject(new Error('Characteristic not found'))
        return
      }

      characteristic.subscribe((error: any) => {
        if (error) {
          console.error('Subscription failed:', error)
          reject(error)
          return
        }

        characteristic.on('data', (data: Buffer, isNotification: boolean) => {
          console.log('Received notification:', characteristicUuid, data)
          this.emit('notification', characteristicUuid, data)
        })

        console.log('Subscribed to notifications:', characteristicUuid)
        resolve()
      })
    })
  }

  async unsubscribeFromNotifications(characteristicUuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const characteristic = this.connectedCharacteristics.get(characteristicUuid)
      if (!characteristic) {
        reject(new Error('Characteristic not found'))
        return
      }

      characteristic.unsubscribe((error: any) => {
        if (error) {
          console.error('Unsubscribe failed:', error)
          reject(error)
          return
        }

        characteristic.removeAllListeners('data')
        console.log('Unsubscribed from notifications:', characteristicUuid)
        resolve()
      })
    })
  }

  getConnectedDevice(): string | null {
    return this.connectedDevice ? this.connectedDevice.id : null
  }

  isDeviceConnected(): boolean {
    return this.connectedDevice !== null
  }

  getState(): string {
    return noble.state
  }
}