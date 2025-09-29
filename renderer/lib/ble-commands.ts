import { UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE } from '../../constants/uuid';
import {hexToBcdBytes} from "./utils";
import {COMMANDS} from "../../constants/ble-protocol";

/**
 * 커맨드 전송 객체를 생성하는 팩토리 함수.
 * BLEContext로부터 `writeData` 함수와 `addLog` 함수를 의존성으로 주입받습니다.
 * @param writeData - BLEContext의 writeData 함수
 * @param addLog - BLEContext의 addLog 함수
 * @returns 커맨드 전송 함수들을 담은 객체
 */
export const createCommandSender = (
  writeData: (uuid: string, data: number[]) => Promise<{ success: boolean; error?: string }>,
  addLog: (message: string) => void
) => ({
  sendFactoryModeOn: () => {
    addLog('Sending: Factory Mode On');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.factoryModeOn);
  },
  sendFactoryModeOff: () => {
    addLog('Sending: Factory Mode Off');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.factoryModeOff);
  },
  sendImprintDeviceName: (deviceType: DeviceType, name: string) => {

    let imprintCommand = null;

    if (deviceType === 'TP-1') imprintCommand = COMMANDS.tpImprint;
    if (deviceType === 'CP-1') imprintCommand = COMMANDS.cpImprint;
    if (deviceType === 'KB-1') imprintCommand = COMMANDS.kbImprint;

    const [hi, mid, low] = hexToBcdBytes(name)

    imprintCommand[4] = hi;
    imprintCommand[5] = mid;
    imprintCommand[6] = low;

    addLog(`Sending: Imprint Device Name ${name} => ${hi}, ${mid}, ${low}`);
    console.log(`Sending: Imprint Device Name ${name} => ${hi}, ${mid}, ${low}`);
    console.log(imprintCommand);
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, imprintCommand);
  },

  sendVerifyPumpSolenoid: () => {
    addLog('Sending: Verify Pump Solenoid');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.vrfPumpSolenoid);
  },
  sendVerifyMic: () => {
    addLog('Sending: Verify Mic Solenoid');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.vrfMic);
  },
  sendVerifyBattCharger: () => {
    addLog('Sending: Verify BattCharger');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.vrfCharger);
  },

  sendTpPowerOff: () => {
    addLog('Sending: TP-1 power off');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.tpPowerOff);
  },
  sendCpPowerOff: () => {
    addLog('Sending: CP-1 power off');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.cpPowerOff);
  },


  sendBpStart: () => {
    addLog('Sending: Start');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.bpStart);
  },
  sendBpStop: () => {
    addLog('Sending: Stop');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.bpStop);
  },
});

export const responseHandler = {

}
