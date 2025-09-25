import { UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE } from './UUID';
import {numberToBcdBytes} from "./utils";

// 전송할 커맨드 페이로드 정의
const COMMANDS = {
  factoryModeOn: [0x02, 0x08, 0x77, 0x10, 0, 0, 0, 0x03],
  factoryModeOff: [0x02, 0x08, 0x77, 0x11, 0, 0, 0, 0x03],


  imprintName: [0x02, 0x08, 0x77, 0x7C, 0, 0, 0, 0x03],

  bpStart: [0x02, 0x08, 0x11, 0x11, 0x00, 0x00, 0x00, 0x03],
  bpStop: [0x02, 0x08, 0x11, 0x33, 0x00, 0x00, 0x00, 0x03],
};

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
    addLog('Sending: Factory Mode On');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.factoryModeOff);
  },
  sendImprintDeviceName: (decimal: number) => {
    const imprintCommand = [...COMMANDS.imprintName];

    const [hi, mid, low] = numberToBcdBytes(decimal)

    imprintCommand[4] = hi;
    imprintCommand[5] = mid;
    imprintCommand[6] = low;

    addLog(`Sending: Imprint Device Name ${decimal} => ${hi}, ${mid}, ${low}`);
    console.log(`Sending: Imprint Device Name ${decimal} => ${hi}, ${mid}, ${low}`);
    console.log(imprintCommand);
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, imprintCommand);
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
