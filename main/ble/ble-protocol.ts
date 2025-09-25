export interface ParsedData {
  type: 'measurement' | 'status' | 'firmwareStatus' | 'unknown';
  payload: any;
}

/**
 * BLE 장치로부터 받은 원시 데이터를 파싱합니다.
 * @param data 수신된 데이터 버퍼
 * @returns 파싱된 구조화된 데이터
 */
export function parseData(data: Buffer): ParsedData {
  try {
    if (!data || data.length < 1) {
      return { type: 'unknown', payload: 'Empty data' };
    }

    // 배터리 상태 패킷 (0x11, 0x22로 시작, 8바이트 길이)
    if (data.length === 8 && data.readUInt8(0) === 0x11 && data.readUInt8(1) === 0x22) {
      const rawValue = data.readUInt8(3);
      const batteryLevel = Math.min((rawValue & 0xff) / 2, 100);
      return {
        type: 'firmwareStatus',
        payload: {
          batteryLevel: batteryLevel,
          cuffType: data.readUInt8(7)
        }
      };
    }

    const eventType = data.readUInt8(0);

    // 로그에 기록된 데이터를 기반으로 파싱 규칙을 추가합니다.
    switch (eventType) {
      // 예: <Buffer 02 08 79 7e 00 00 00 01>
      case 0x02:
        return {
          type: 'status',
          payload: {
            status1: data.readUInt8(1),
            status2: data.readUInt16LE(2),
          }
        };

      default:
        return { type: 'unknown', payload: data.toString('hex') };
    }
  } catch (error) {
    console.error('Error parsing data:', error);
    return { type: 'unknown', payload: `Error parsing: ${data.toString('hex')}` };
  }
}
