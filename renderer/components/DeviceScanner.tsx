import Button from "./ui/Button";
import {BleResultType, useBLE} from "../contexts/BLEContext";
import React, {useCallback, useState, useEffect} from "react";
import {useDialog} from "../contexts/DialogContext";
import {HStack, VStack} from "./ui/Stack";
import {LucideBluetoothOff} from "lucide-react";
import Divider from "./ui/Divider";
import BatteryIndicator from "./ui/BatteryIndicator";
import ActivityIndicator from "./ui/ActivityIndicator";

export default function DeviceScanner() {

  const {bleState, startScan, stopScan, connect, disconnect, discoverServices} = useBLE();

  const dialog = useDialog();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showCharacteristics, setShowCharacteristics] = useState(false);
  const [disconnectResolver, setDisconnectResolver] = useState<((value: any) => void) | null>(null);

  // 디버깅용: connectedDevice 상태 변화 추적
  useEffect(() => {
    console.log('DeviceScanner: connectedDevice changed:', bleState.connectedDevice?.id, bleState.connectedDevice?.name);
  }, [bleState.connectedDevice]);

  // 연결 해제 완료 감지
  useEffect(() => {
    if (!bleState.isConnected && !bleState.connectedDevice && disconnectResolver) {
      console.log('Disconnect completed, resolving promise');
      disconnectResolver(null);
      setDisconnectResolver(null);
    }
  }, [bleState.isConnected, bleState.connectedDevice, disconnectResolver]);


  const handleScanStart = async () => {
    try {
      await startScan(10000) // 10초 스캔
    } catch (error) {
      console.error('Scan failed:', error)
    }
  }

  const handleScanStop = async () => {
    try {
      await stopScan()
    } catch (error) {
      console.error('Stop scan failed:', error)
    }
  }

  const handleConnect = async (deviceId: string) => {

    console.log(deviceId, bleState.isConnected)
    if (bleState.isConnected) {
      dialog.showConfirm('기기 연결', '연결된 기기를 해제하고 선택한 기기로 연결하시겠습니까?', async () => {
        // 연결 해제를 기다리지 않고 바로 새 기기 연결
        connectToDevice(deviceId);
      });
    }
    else {
      connectToDevice(deviceId);
    }
  }

  const connectToDevice = async (deviceId: string) => {
    await handleScanStop();
    setIsConnecting(true);

    try {
      // 기존 연결이 있다면 먼저 해제하고 완료까지 대기
      if (bleState.isConnected) {
        console.log('Disconnecting current device before connecting to new one');

        // Promise를 생성하고 resolver를 저장
        const disconnectPromise = new Promise((resolve) => {
          setDisconnectResolver(() => resolve);
        });

        await disconnect();

        // 연결 해제 완료까지 대기 (useEffect에서 resolve됨)
        await disconnectPromise;
      }

      const connectPromise = connect(deviceId);
      const timeoutPromise = new Promise<BleResultType>((_, reject) =>
        setTimeout(() => reject({ success: false, error: '연결하는데 너무 오래 걸립니다. (5초 경과)'}), 5000)
        // reject는 바깥 error로 날아감
      );
      const result = await Promise.race([connectPromise, timeoutPromise]);
      if (!result.success) {
        dialog.showError('연결 실패', result.error);
      }

    } catch (error) {
      dialog.showError('연결 실패', (error?.error ?? '기기 스캔을 재시도해 보시기 바랍니다.'))
    } finally {
      setIsConnecting(false);
    }
  }

  const handleDiscoverServices = async () => {
    try {
      await discoverServices()
    } catch (error) {
      console.error('Service discovery failed:', error)
    }
  }

  const handleDisconnect = async () => {
    await disconnect();
  }

  const getRssiColor = useCallback((rssi: number) => {
    // RSSI 신호 강도에 따른 색상 분류
    // -30 이상: 매우 강함 (초록)
    // -50 이상: 강함 (초록)
    // -70 이상: 보통 (노랑)
    // -85 이상: 약함 (주황)
    // -85 미만: 매우 약함 (빨강)

    if (rssi >= -50) {
      return "text-green-500 dark:text-green-400"
    } else if (rssi >= -70) {
      return "text-yellow-500 dark:text-yellow-400"
    } else if (rssi >= -85) {
      return "text-orange-500 dark:text-orange-400"
    } else {
      return "text-red-500 dark:text-red-400"
    }
  }, [])

  return (
    <VStack gap={2}>

      <h3>연결된 기기</h3>
      <VStack
        appearance={`${bleState.isConnected ? 'outlined' : 'default'}`}
        className={`${bleState.isConnected ? '!border-purple-500 dark:!border-amber-500' : ''}`}
      >
        {bleState.connectedDevice ? (
          <VStack>
            <VStack className={"bg"} gap={4}>

              {/* info */}
              <HStack justifyContent={"space-between"}>
                <span className="font-medium">{bleState.connectedDevice.name}</span>
                <HStack gap={2} className="text-sm text-gray-500 dark:text-gray-400">
                  {/*<span>배터리:</span>*/}
                  <BatteryIndicator level={bleState.connectedDevice.batteryLevel}/>
                </HStack>
              </HStack>

              {/* buttons */}
              <HStack justifyContent={"flex-end"} gap={2}>
                <div className="relative">
                  <Button
                    onClick={() => setShowCharacteristics(!showCharacteristics)}
                    size="sm"
                    icon={showCharacteristics ? "X" : "List"}
                    appearance="outlined"
                  >
                    {showCharacteristics ? "닫기" : "서비스/특성"}
                  </Button>

                  {/* 팝업 박스 */}
                  {showCharacteristics && (
                    <VStack appearance="surface"
                      className="absolute left-0 top-full mt-2 w-[500px] max-h-150 shadow-lg z-50 overflow-y-auto border border-gray-500">
                      <h3>서비스 / 특성</h3>
                      <div className="p-4">
                        <div className="text-sm">
                          {bleState.services.length > 0 ? (
                            bleState.services.map((service) => (
                              <div key={service.uuid} className="mb-4">
                                {/* 서비스 */}
                                <HStack gap={2} className="mb-2">
                                  <span className="rounded-lg px-2 bg-blue-700 dark:bg-blue-300 text-white dark:text-black">Service</span>
                                  <span className="text-blue-700 dark:text-blue-300">{service.uuid}</span>
                                </HStack>
                                {/* 특성들 */}
                                {service.characteristics.map((char) => (
                                  <VStack key={char.uuid} gap={1}
                                       className="ml-6 mb-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <HStack gap={2}>
                                      <span className="rounded-lg px-1 bg-green-700 dark:bg-green-300 text-white dark:text-black">Characteristic</span>
                                      <span className="text-green-700 dark:text-green-300">{char.uuid}</span>
                                    </HStack>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 ml-4">
                                      [{char.properties.join(', ')}]
                                    </div>
                                  </VStack>
                                ))}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500">서비스를 발견하지 못했습니다.</div>
                          )}
                        </div>
                      </div>
                    </VStack>
                  )}
                </div>
                <Button
                  onClick={handleDisconnect}
                  size="sm"
                  icon="BluetoothOff"
                  mode="error"
                  appearance="outlined"
                >
                  연결끊기
                </Button>
              </HStack>

            </VStack>

          </VStack>
        ) : (
          <div className="text-gray-500">연결된 기기 없음</div>
        )
        }
      </VStack>

      <Divider/>

      <VStack gap={4}>

        <HStack gap={4} justifyContent={"space-between"} alignItems={"flex-end"}>
          <h3>찾은 기기 목록</h3>
          {!bleState.isScanning ? (
          <Button
            onClick={handleScanStart}
            disabled={bleState.isScanning || isConnecting}
            appearance="contained"
            mode="primary"
            icon="Search"
          >
            기기 스캔
          </Button>
          ) : (
            <Button
              onClick={handleScanStop}
              appearance="outlined"
              mode="warning"
              icon="StopCircle"
            >
              스캔 중지
            </Button>
          )}
        </HStack>

        <VStack>

          {bleState.isScanning && (
            <VStack justifyContent={"center"} alignItems={"center"}>
              <ActivityIndicator.LegacySpinner />
              <div className="text-sm text-gray-500">기기 찾는 중...</div>
            </VStack>
          )}

          {bleState.scannedDevices.length > 0 ? (
            <div>
              <ul className="mt-2 border rounded divide-y">
                {bleState.scannedDevices.map((device) => (
                  <li
                    key={device.id}
                    className="p-3 flex items-center justify-between hover:bg-gray-400/30"
                  >
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <HStack className="text-sm text-gray-500" gap={1}>
                        <span>RSSI:</span>
                        <span className={getRssiColor(device.rssi)}>{device.rssi}</span>
                        <span>dBm</span>
                      </HStack>
                    </div>
                    <Button
                      onClick={() => handleConnect(device.id)}
                      size="sm"
                      icon="Bluetooth"
                      disabled={(bleState.isConnected && bleState.connectedDevice.id === device.id) || isConnecting}
                    >
                      {bleState.isConnected && bleState.connectedDevice.id === device.id ? '연결됨' :
                        isConnecting ? '연결중' : '연결'}
                    </Button>
                  </li>
                ))}
              </ul>

            </div>
          ) : (
            <div className="text-gray-500">
              {!bleState.isScanning && '스캔을 시작하여 기기를 찾으세요'}
            </div>
          )}

        </VStack>
      </VStack>
    </VStack>
  )
}