import noble from '@abandonware/noble'
import { EventEmitter } from 'events'
import { parseData } from './ble-protocol'

/**
 * Buffer를 16진수 문자열로 변환합니다.
 */
function bufferToHex(data: Buffer, format: 'compact' | 'spaced' | 'array' | 'debug' = 'spaced'): string {
  if (!data || data.length === 0) {
    return '';
  }

  const hexBytes = Array.from(data).map(byte => byte.toString(16).padStart(2, '0').toUpperCase());

  switch (format) {
    case 'compact':
      return hexBytes.join('');
    case 'spaced':
      return hexBytes.join(' ');
    case 'array':
      return '[' + hexBytes.map(hex => '0x' + hex).join(', ') + ']';
    case 'debug':
      return `Buffer(${data.length}): ${hexBytes.join(' ')}`;
    default:
      return hexBytes.join(' ');
  }
}

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
  private discoveredPeripherals: Map<string, any> = new Map()

  constructor() {
    super()
    this.setupNobleListeners()
  }

  private setupNobleListeners() {
    noble.on('stateChange', (state) => {
      try {
        console.log('BLE state changed:', state)
        this.emit('stateChange', state)

        if (state === 'poweredOn') {
          console.log('BLE is powered on and ready')
        } else {
          console.log('BLE is not available:', state)
          if (this.isScanning) {
            this.stopScan().catch(err => console.error('Failed to stop scan:', err))
          }
        }
      } catch (error) {
        console.error('Error in stateChange handler:', error)
      }
    })

    noble.on('discover', (peripheral) => {
      try {
        // Store the peripheral for later connection
        this.discoveredPeripherals.set(peripheral.id, peripheral)

        const name = peripheral.advertisement?.localName;
        if (!name || !name.startsWith("KOABP-")) return;

        const device: BLEDevice = {
          id: peripheral.id,
          name: name || 'Unknown Device',
          rssi: peripheral.rssi,
          advertisement: peripheral.advertisement
        }

        console.log('Discovered device:', device.name, device.id)
        this.emit('deviceDiscovered', device)
      } catch (error) {
        console.error('Error in discover handler:', error)
      }
    })

    noble.on('scanStart', () => {
      try {
        console.log('Scan started')
        this.isScanning = true
        this.emit('scanStart')
      } catch (error) {
        console.error('Error in scanStart handler:', error)
      }
    })

    noble.on('scanStop', () => {
      try {
        console.log('Scan stopped')
        this.isScanning = false
        this.emit('scanStop')
      } catch (error) {
        console.error('Error in scanStop handler:', error)
      }
    })

    noble.on('warning', (message) => {
      console.warn('Noble warning:', message)
    })

    noble.on('error', (error) => {
      console.error('Noble error:', error)
    })
  }

  async startScan(timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (noble._state !== 'poweredOn') {
        reject(new Error('BLE is not powered on'))
        return
      }

      console.log('Starting BLE scan...')
      // Clear previously discovered peripherals
      this.discoveredPeripherals.clear()
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

      const peripheral = this.discoveredPeripherals.get(deviceId)
      if (!peripheral) {
        reject(new Error(`Device not found: ${deviceId}. Make sure to scan for devices first.`))
        return
      }

      console.log('Connecting to device:', deviceId, 'Name:', peripheral.advertisement.localName)

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 10000) // 10 seconds timeout

      peripheral.connect((error: any) => {
        clearTimeout(connectionTimeout)

        if (error) {
          console.error('Connection failed:', error)
          reject(new Error(`Connection failed: ${error.message || error}`))
          return
        }

        this.connectedDevice = peripheral
        console.log('Connected to device:', deviceId)
        this.emit('deviceConnected', deviceId)

        // Setup disconnect handler
        peripheral.once('disconnect', () => {
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


  private handleDataReceived(characteristicUuid: string, data: Buffer) {
    const parsedData = parseData(data);
    console.log(`Parsed data from ${characteristicUuid}:`, JSON.stringify(parsedData), `data: ${bufferToHex(data)}`);

    // 파싱된 구조화된 데이터를 emit
    this.emit('deviceDataParsed', { characteristicUuid, parsedData });
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

        // 중앙 핸들러를 통해 데이터 처리
        this.handleDataReceived(characteristicUuid, data);
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

        // 'data' 이벤트 리스너에서 중앙 핸들러 호출
        characteristic.on('data', (data: Buffer) => {
          try {
            this.handleDataReceived(characteristicUuid, data);
          } catch (e) {
            console.error('!!! Critical error in data handler:', e)
          }
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
    return noble._state
  }
}