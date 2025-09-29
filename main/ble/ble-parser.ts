import {COMMANDS, RECV_PATTERNS} from '../../constants/ble-protocol';

/**
 * Buffer와 16진수 배열을 비교합니다.
 * 더 짧은 쪽의 길이만큼만 비교하고, 해당 범위에서 모든 바이트가 일치하면 true를 반환합니다.
 */
function compareBufferWithHex(buffer: Buffer, hexArray: number[], length?: number): boolean {
  if (!buffer || !hexArray || (length !== undefined && length <= 0)) {
    return false;
  }

  // length가 있다면 그 값을, 더 짧은 길이 선택
  const compareLength = length || Math.min(buffer.length, hexArray.length);

  if (compareLength === 0) {
    return true; // 둘 다 빈 경우는 일치로 간주
  }

  // 바이트 단위로 비교
  for (let i = 0; i < compareLength; i++) {
    if (buffer.readUInt8(i) !== hexArray[i]) {
      return false;
    }
  }

  return true;
}

export interface ParsedData {
  type: 'batteryInfo' | 'response' | 'deviceStatus' | 'tpRaw' | 'unknown';
  payload: any;
}

export type ResponseType = 'ACK' | 'PASS' | 'FAIL';


/**
 * BLE 장치로부터 받은 원시 데이터를 파싱합니다.
 * @param data 수신된 데이터 버퍼
 * @returns 파싱된 구조화된 데이터
 */
export function parseData(data: Buffer): ParsedData {
  try {

    // 1. TP -> Raw only
    if (data.length > 8 && compareBufferWithHex(data, RECV_PATTERNS.tpRawPrefix)) {
      const rawValue = data.readUInt8(6);
      const batteryLevel = Math.min((rawValue & 0xff) / 2, 100);
      return { type: 'batteryInfo', payload: { batteryLevel }}
    }
    else if (data.length > 8 && compareBufferWithHex(data, RECV_PATTERNS.cpRawPrefix)) {
      const rawValue = data.readUInt8(6);
      const batteryLevel = Math.min((rawValue & 0xff) / 2, 100);
      return { type: 'batteryInfo', payload: { batteryLevel }}
    }
    // KB-1 배터리 상태 패킷 (0x11, 0x22로 시작, 8바이트 길이)
    else if (compareBufferWithHex(data, RECV_PATTERNS.kbBatteryInfoPrefix)) {
      const rawValue = data.readUInt8(3);
      const batteryLevel = Math.min((rawValue & 0xff) / 2, 100);
      return {
        type: 'batteryInfo',
        payload: {
          batteryLevel,
          // firmwareVersion: `${data.readUInt8(4)}.${data.readUInt8(5)}.${data.readUInt8(6)}`,
          // cuffType: data.readUInt8(7)
        }
      };
    }
    else if (compareBufferWithHex(data, COMMANDS.tpImprint, 4)) {
      return { type: 'response', payload: { command: 'tpImprint' } };
    }
    else if (compareBufferWithHex(data, COMMANDS.cpImprint, 4)) {
      return { type: 'response', payload: { command: 'cpImprint' } };
    }
    else if (compareBufferWithHex(data, COMMANDS.kbImprint, 4)) {
      return { type: 'response', payload: { command: 'kbImprint' } };
    }
    // factoryMode, verifying 은 요청에 대해 ACK으로 동일한 값을 수신한다.
    else {
      const keys = Object.keys(COMMANDS);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = COMMANDS[key];
        if (compareBufferWithHex(data, value)) {
          return { type: 'response', payload: { command: key } };
        }
      }
    }

    return { type: 'unknown', payload: { message: 'Unknown response' } };

  } catch (error) {
    return { type: 'unknown', payload: { message: `Error parsing: ${data.toString('hex')}`} };
  }
}
