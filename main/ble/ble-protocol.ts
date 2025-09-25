/**
 * Buffer와 16진수 배열을 비교합니다.
 * 더 짧은 쪽의 길이만큼만 비교하고, 해당 범위에서 모든 바이트가 일치하면 true를 반환합니다.
 */
function compareBufferWithHex(buffer: Buffer, hexArray: number[]): boolean {
  if (!buffer || !hexArray) {
    return false;
  }

  // 더 짧은 길이 선택
  const compareLength = Math.min(buffer.length, hexArray.length);

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
  type: 'firmwareStatus' | 'response' | 'deviceStatus' | 'unknown';
  payload: any;
}

export type ResponseType = 'ACK' | 'PASS' | 'FAIL';

const RECV_FIRMWARE_PREFIX = [0x11, 0x22]
const RECV_ACK_PREFIX = [0x11, 0x7c, 0x77]

/**
 * BLE 장치로부터 받은 원시 데이터를 파싱합니다.
 * @param data 수신된 데이터 버퍼
 * @returns 파싱된 구조화된 데이터
 */
export function parseData(data: Buffer): ParsedData {
  try {

    // 주요 데이터는 8바이트
    if (!data || data.length !== 8) {
      return { type: 'unknown', payload: { message: 'Invalid data length' } };
    }


    // 배터리 상태 패킷 (0x11, 0x22로 시작, 8바이트 길이)
    if (compareBufferWithHex(data, RECV_FIRMWARE_PREFIX)) {
      const rawValue = data.readUInt8(3);
      const batteryLevel = Math.min((rawValue & 0xff) / 2, 100);
      return {
        type: 'firmwareStatus',
        payload: {
          batteryLevel: batteryLevel,
          firmwareVersion: `${data.readUInt8(4)}.${data.readUInt8(5)}.${data.readUInt8(6)}`,
          cuffType: data.readUInt8(7)
        }
      };
    }
    else if (compareBufferWithHex(data, RECV_ACK_PREFIX) && data.readUInt8(7) === 0x03) {
      let response: ResponseType = null
      const command = data.readUInt8(3);
      const value = data.readUInt8(4);

      switch (value) {
        case 0x10: response = 'ACK'; break;
        case 0x20: response = 'PASS'; break;
        case 0x3F: response = 'FAIL'; break;
      }

      return { type: 'response', payload: { command, response } };
    }


    return { type: 'unknown', payload: { message: 'Unknown response' } };

  } catch (error) {
    console.error('Error parsing data:', error);
    return { type: 'unknown', payload: { message: `Error parsing: ${data.toString('hex')}`} };
  }
}
