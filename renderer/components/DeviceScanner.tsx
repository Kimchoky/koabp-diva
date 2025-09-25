import Button from "./ui/Button";
import {BleResultType, useBLE} from "../contexts/BLEContext";
import React, {useCallback, useState, useEffect} from "react";
import {useDialog} from "../contexts/DialogContext";
import {HStack, VStack} from "./ui/Stack";
import {LucideBluetoothOff, X} from "lucide-react";
import Divider from "./ui/Divider";
import BatteryIndicator from "./ui/BatteryIndicator";
import ActivityIndicator from "./ui/ActivityIndicator";
import DeviceConnected from "./DeviceConnected";

export default function DeviceScanner() {

  const {bleState, startScan, stopScan, connect, connectToRecentDevice, disconnect, getConnectedDevice, recentDevices, removeDeviceFromHistory, clearDeviceHistory} = useBLE();

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

    if (bleState.isConnected) {
      dialog.showConfirm('기기 연결', '연결된 기기를 해제하고 선택한 기기로 연결하시겠습니까?', async () => {
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

  const handleDisconnect = async () => {
    await disconnect();
  }

  const handleConnectToRecent = async (deviceId: string) => {
    if (bleState.isConnected) {
      dialog.showConfirm('기기 연결', '연결된 기기를 해제하고 선택한 기기로 연결하시겠습니까?', async () => {
        connectToRecentDevice(deviceId);
      });
    } else {
      await connectToRecentDevice(deviceId);
    }
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
    <VStack gap={4}>


      {/* 최근 연결한 기기 목록 */}
      {recentDevices.length > 0 && (
        <VStack gap={2}>
          <HStack gap={4} justifyContent={"space-between"} alignItems={"flex-end"}>
            <h3 className="">최근 연결한 기기</h3>
            <Button
              onClick={clearDeviceHistory}
              appearance="outlined"
              mode="error"
              icon="Trash2"
              size="sm"
            >
              이력 지우기
            </Button>
          </HStack>

            <ul className="bordered divide-y divide-border-light dark:divide-border-dark">
              {recentDevices.map((device) => {
                const isConnectedDevice = bleState.isConnected && bleState.connectedDevice?.id === device.id;
                return (
                  <li
                    key={device.id}
                    className={`p-3 hover:bg-gray-400/30
                                ${isConnectedDevice && 'border-l-8 border-l-primary'}`}
                  >
                      <HStack justifyContent={"space-between"} alignItems={"center"}>
                        <VStack>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-gray-500">
                            <div>마지막 연결 (총 {device.connectionCount}회)</div>
                            <div>{device.lastConnected.toLocaleString()}</div>
                          </div>
                        </VStack>

                        <VStack justifyContent={"flex-end"} className={'self-stretch'}>
                          { !isConnectedDevice && (
                            <X className="self-end cursor-pointer text-error"
                               onClick={() => removeDeviceFromHistory(device.id)}/>
                          )}
                          <Button
                          onClick={() => handleConnectToRecent(device.id)}
                          size="sm"
                          icon="Bluetooth"
                          disabled={isConnectedDevice || isConnecting}
                        >
                          { isConnectedDevice
                            ? '연결됨'
                            : isConnecting
                              ? '연결중..'
                              : '바로 연결'
                          }
                        </Button>
                        </VStack>
                      </HStack>
                  </li>
                )}
              )}
            </ul>
        </VStack>
      )}

      { recentDevices.length > 0 && (
        <Divider />
      )}

      <VStack gap={2}>

        <HStack gap={4} justifyContent={"space-between"} alignItems={"flex-end"}>
          <h3 className="">찾은 기기 목록</h3>
          {!bleState.isScanning ? (
          <Button
            onClick={handleScanStart}
            disabled={bleState.isScanning || isConnecting}
            appearance="contained"
            mode="primary"
            icon="Search"
            size="sm"
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
            <HStack alignItems={"center"} justifyContent={"center"} gap={2} className={"py-4"}>
              <ActivityIndicator.LegacySpinner width={15} height={15} />
              <ActivityIndicator.TextGradient palette={"orange"} speed={2}>주변의 기기를 찾는 중</ActivityIndicator.TextGradient>
            </HStack>
          )}

          {bleState.scannedDevices.length > 0 ? (
              <ul className="bordered divide-y divide-border-light dark:divide-border-dark">
                {bleState.scannedDevices.map((device) => {
                  const isConnectedDevice = bleState.isConnected && bleState.connectedDevice.id === device.id;
                  return (
                    <li
                      key={device.id}
                      className={`p-3 flex items-center justify-between hover:bg-gray-400/30
                                  ${isConnectedDevice && 'border-l-8 border-l-primary'}`}
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
                        disabled={isConnectedDevice || isConnecting}
                      >
                        { isConnectedDevice
                          ? '연결됨'
                          : isConnecting
                            ? '연결중..'
                            : '연결'
                        }
                      </Button>
                    </li>
                  )}
                )}
              </ul>
          ) : (
            <div className="text-gray-500 self-stretch h-full">
              <div className="text-center">
                {!bleState.isScanning && '스캔을 시작하여 기기를 찾으세요'}
              </div>
            </div>
          )}

        </VStack>
         <HStack gap={2} className="">
            TEST:
            <Button onClick={()=>{bleState.connectedDevice = { id: 'tet', name: 'dummy',  rssi: -10, advertisement: 'hooo', batteryLevel: (new Date().getTime()%80+15)}; disconnect()}}>con</Button>
            <Button onClick={()=>{bleState.connectedDevice = null; disconnect()}}>discon</Button>
          </HStack>
      </VStack>
    </VStack>
  )
}