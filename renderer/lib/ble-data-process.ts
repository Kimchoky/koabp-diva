import {BLEState, ParsedData} from '../contexts/BLEContext';
import {UiStateType} from "../contexts/SessionContext";

export interface DataProcessorStates {
  bleState: BLEState;
  uiState: UiStateType;
}

export interface DataProcessorCallbacks {
  setBleState: (updater: (prev: BLEState) => BLEState) => void;
  setUiState: (updater: (prev: UiStateType) => UiStateType) => void;
  addLog: (message: string) => void;
  disconnect: () => Promise<any>;
}

export class BLEDataProcessor {
  private batteryTimeoutRef: NodeJS.Timeout | null = null;
  private readonly BATTERY_TIMEOUT_MS = 5000;
  private states: DataProcessorStates;
  private callbacks: DataProcessorCallbacks;

  constructor(states: DataProcessorStates, callbacks: DataProcessorCallbacks) {
    this.states = states;
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
    if (parsedData.type === 'batteryInfo') {
      this.onBatteryDataReceived(parsedData);
    }
    else if (parsedData.type === 'response') {
      const command = parsedData.payload.command;
      switch (command) {
        case 'factoryModeOn': {
          this.callbacks.setUiState(prev => ({ ...prev, factoryMode: 'on' }));
          break;
        }
        case 'factoryModeOff': {
          this.callbacks.setUiState(prev => ({ ...prev, factoryMode: 'off' }));
          break;
        }
        case 'tpImprint': {
          this.applyDeviceImprinting('TP-1');
          break;
        }
        case 'cpImprint': {
          this.applyDeviceImprinting('CP-1');
          break;
        }
        case 'kbImprint': {
          this.applyDeviceImprinting('KB-1');
          this.callbacks.disconnect();
          break;
        }
      }
    }
    else {
      this.callbacks.setBleState(prev => ({ ...prev, lastParsedData: parsedData }));
    }
  };

  applyDeviceImprinting = (type: DeviceType) => {
    const connDevice = this.states.bleState.connectedDevice;
    this.callbacks.setUiState(prev => ({
      ...prev,
      imprintDevice: {
        type,
        id: connDevice.id,
        name: connDevice.name,
        timestamp: new Date()
      }
    }));
  }

  cleanup = () => {
    if (this.batteryTimeoutRef) {
      clearTimeout(this.batteryTimeoutRef);
    }
  };
}