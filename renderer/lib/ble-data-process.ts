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

      // 배터리 레벨이 변경된 경우에만 업데이트
      let shouldUpdateBattery = false;
      if (!currBatteryLevel || (newBatteryLevel !== currBatteryLevel)) {
        newState.connectedDevice = {
          ...prev.connectedDevice,
          batteryLevel: newBatteryLevel
        };
        shouldUpdateBattery = true;
        this.callbacks.addLog(`Updating battery level for ${prev.connectedDevice.name} to ${newBatteryLevel}%`);
      }

      // 통신 상태가 변경된 경우에만 업데이트
      const shouldUpdateHealthy = !prev.communicationHealthy;

      // 마지막 수신 시간은 1초 이상 차이가 날 때만 업데이트 (UI 깜빡임 방지)
      const shouldUpdateTime = !prev.lastBatteryDataTime ||
        (now.getTime() - prev.lastBatteryDataTime.getTime()) > 1000;

      // 변경사항이 있을 때만 상태 업데이트
      if (shouldUpdateBattery || shouldUpdateHealthy || shouldUpdateTime) {
        return {
          ...prev,
          ...newState,
          communicationHealthy: true,
          lastBatteryDataTime: shouldUpdateTime ? now : prev.lastBatteryDataTime,
        };
      }

      // 변경사항이 없으면 기존 상태 유지
      return prev;
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
    console.log('processDeviceDataParsed', parsedData);
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

  /**
   * Name 설정에 대한 응답 후 처리. UI 처리를 위해 상태값을 변화시킨다.
   * @param type
   */
  applyDeviceImprinting = (type: DeviceType) => {
    const connDevice = this.states.bleState.connectedDevice;
    this.callbacks.setUiState(prev => ({
      ...prev,
      imprintDevice: {
        type,
        id: connDevice.id,
        name: connDevice.name,
        timestamp: new Date().getTime()
      }
    }));
  }

  cleanup = () => {
    if (this.batteryTimeoutRef) {
      clearTimeout(this.batteryTimeoutRef);
    }
  };
}