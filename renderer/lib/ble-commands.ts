import { UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE } from './UUID';

// 전송할 커맨드 페이로드 정의
const COMMANDS = {
  factoryModeOn: [0x01, 0x01],
  start: [0x01, 0x02],
  stop: [0x01, 0x03],
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
  sendStart: () => {
    addLog('Sending: Start');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.start);
  },
  sendStop: () => {
    addLog('Sending: Stop');
    return writeData(UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE, COMMANDS.stop);
  },
});
