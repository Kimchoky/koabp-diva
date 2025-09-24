/**
 * ⚠️ react-native-ble-plx 라이브러리의 characteristic.uuid 는 lowerCase.
 */

// KoaBP service UUID
export const UUID_SERVICE_CUSTOM_TOTAL = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
// KoaBP (write) characteristic UUID: 데이터 송신
export const UUID_CHARACTERISTIC_CUSTOM_TOTAL_WRITE = '6e400002b5a3f393e0a9e50e24dcca9e';
// KoaBP (notifiable) characteristic UUID: 데이터 수신
export const UUID_CHARACTERISTIC_CUSTOM_TOTAL_NOTIFY_DATA = '6e400003b5a3f393e0a9e50e24dcca9e';


// 알 수 없음
export const UUID_CLIENT_CHARACTERISTIC_CONFIG = '00002902-0000-1000-8000-00805f9b34fb';
// 알 수 없는 characteristic. 1byte 패킷(0d45, 0d46)이 지속적으로 들어오는데 뭔지 모르겠음
export const UUID_CHARACTERISTIC_NOTIFIABLE_UNKNOWN = '00002a19-0000-1000-8000-00805f9b34fb';

/** KB-1 (No-LCD)
 *
 * Service            : Data Transmit. Notifiable
 * Service UUID       : 6e400001-b5a3-f393-e0a9-e50e24dcca9e
 * Characteristic UUID: 6e400003-b5a3-f393-e0a9-e50e24dcca9e
 *
 * Service            : 알 수 없음. Notifiable
 * Service UUID       : 00002a19-0000-1000-8000-00805f9b34fb
 * Characteristic UUID: 00002a19-0000-1000-8000-00805f9b34fb
 * */