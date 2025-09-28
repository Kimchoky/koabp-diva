import { ParsedData, BLEDevice, BLEState } from '../contexts/BLEContext';
import { ResponseType } from '../../main/ble/ble-protocol';

export interface DataProcessorCallbacks {
  setBleState: (updater: (prev: BLEState) => BLEState) => void;
  addLog: (message: string) => void;
  disconnect: () => Promise<any>;
}

export class BLEDataProcessor {
  private batteryTimeoutRef: NodeJS.Timeout | null = null;
  private readonly BATTERY_TIMEOUT_MS = 5000;
  private callbacks: DataProcessorCallbacks;

  constructor(callbacks: DataProcessorCallbacks) {
    this.callbacks = callbacks;
  }

  startBatteryTimeout = () => {
    if (this.batteryTimeoutRef) {
      clearTimeout(this.batteryTimeoutRef);
    }

    this.batteryTimeoutRef = setTimeout(() => {
      this.callbacks.setBleState(prev => {
        if (prev.isConnected && prev.communicationHealthy) {
          this.callbacks.addLog('Battery data timeout - communication may be unhealthy');
          return {
            ...prev,
            communicationHealthy: false
          };
        }
        return prev;
      });
    }, this.BATTERY_TIMEOUT_MS);
  };

  onBatteryDataReceived = (parsedData: ParsedData) => {
    const now = new Date();
    const newState: Partial<BLEState> = {};

    this.callbacks.setBleState(prev => {
      if (!prev.connectedDevice) {
        return { ...prev, lastParsedData: parsedData };
      }

      const currBatteryLevel = prev.connectedDevice.batteryLevel;
      const newBatteryLevel = parsedData.payload.batteryLevel;

      if (!currBatteryLevel || (newBatteryLevel !== currBatteryLevel)) {
        newState.connectedDevice = {
          ...prev.connectedDevice,
          batteryLevel: newBatteryLevel
        };
        this.callbacks.addLog(`Updating battery level for ${prev.connectedDevice.name} to ${newBatteryLevel}%`);
      }

      return {
        ...prev,
        ...newState,
        communicationHealthy: true,
        lastBatteryDataTime: now,
      };
    });

    this.startBatteryTimeout();
  };

  cleanupBatteryTimeout = () => {
    if (this.batteryTimeoutRef) {
      clearTimeout(this.batteryTimeoutRef);
      this.batteryTimeoutRef = null;
    }
    this.callbacks.setBleState(prev => ({
      ...prev,
      communicationHealthy: false,
      lastBatteryDataTime: null
    }));
  };

  processDeviceDataParsed = ({ characteristicUuid, parsedData }: { characteristicUuid: string, parsedData: ParsedData }) => {
    if (parsedData.type === 'firmwareStatus') {
      this.onBatteryDataReceived(parsedData);
    }
    else if (parsedData.type === 'response') {
      const command = parsedData.payload.command;
      const response: ResponseType = parsedData.payload.response;

      if (response === 'ACK') {
        switch (command) {
          case 0x10: {
            this.callbacks.setBleState(prev => ({ ...prev, factoryMode: 'on' }));
            break;
          }
          case 0x11: {
            this.callbacks.setBleState(prev => ({ ...prev, factoryMode: 'off' }));
            break;
          }
          case 0x7c: {
            this.callbacks.disconnect();
            break;
          }
        }
      }
    }
    else {
      this.callbacks.setBleState(prev => ({ ...prev, lastParsedData: parsedData }));
    }
  };

  cleanup = () => {
    if (this.batteryTimeoutRef) {
      clearTimeout(this.batteryTimeoutRef);
    }
  };
}