import Button from "./ui/Button";
import {BleResultType, useBLE} from "../contexts/BLEContext";
import React, {useCallback, useEffect, useState} from "react";
import {useDialog} from "../contexts/DialogContext";
import {HStack, VStack} from "./ui/Stack";
import {X} from "lucide-react";
import Divider from "./ui/Divider";
import ActivityIndicator from "./ui/ActivityIndicator";
import {useAudit} from "../contexts/AuditContext";
import {ActionResult, UserActionType} from "../types/audit";

export default function DeviceScanner() {

  const {bleState, startScan, stopScan, connect, connectToRecentDevice, disconnect, getConnectedDevice, recentDevices, removeDeviceFromHistory, clearDeviceHistory} = useBLE();

  const dialog = useDialog();
  const audit = useAudit();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showCharacteristics, setShowCharacteristics] = useState(false);
  const [disconnectResolver, setDisconnectResolver] = useState<((value: any) => void) | null>(null);

  // 디버깅용: connectedDevice 상태 변화 추적
  useEffect(() => {
    audit.logDebug('연결된 기기 상태 변화', {
      data: {
        deviceId: bleState.connectedDevice?.id,
        deviceName: bleState.connectedDevice?.name,
        isConnected: bleState.isConnected,
      },
    });
  }, [bleState.connectedDevice, audit]);

  // 연결 해제 완료 감지
  useEffect(() => {
    if (!bleState.isConnected && !bleState.connectedDevice && disconnectResolver) {
      audit.logDebug('기기 연결 해제 완료');
      disconnectResolver(null);
      setDisconnectResolver(null);
    }
  }, [bleState.isConnected, bleState.connectedDevice, disconnectResolver, audit]);


  const handleScanStart = async () => {
    const actionId = audit.startAction(UserActionType.BLE_SCAN_START,
      '블루투스 기기 스캔 시작',
      {
        component: 'DeviceScanner',
        metadata: {
          scanDuration: 10000
        }
      }
    );

    try {
      audit.logInfo('BLE 스캔 시작', {
        actionId,
        data: { scanDuration: '10초' }
      });
// 6e400001b5a3f393e0a9e50e24dcca9e
// 6e400001b5a3f393e0a9e50e24dcca9e
      await startScan([], 10000) // 10초 스캔

      audit.endAction(actionId, ActionResult.SUCCESS, {
        metadata: {
          foundDevices: bleState.scannedDevices.length
        }
      });
    } catch (error) {
      audit.logError('BLE 스캔 실패', {
        actionId,
        error: error.message
      });

      audit.endAction(actionId, ActionResult.FAILURE, {
        error: {
          message: error.message || 'Unknown scan error'
        }
      });
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
    const device = bleState.scannedDevices.find(d => d.id === deviceId);

    audit.logInfo('기기 연결 시도', {
      data: {
        deviceId,
        deviceName: device?.name,
        isCurrentlyConnected: bleState.isConnected
      }
    });

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
    const device = bleState.scannedDevices.find(d => d.id === deviceId);
    const actionId = audit.startAction(
      UserActionType.BLE_DEVICE_CONNECT,
      `기기 연결: ${device?.name || deviceId}`,
      {
        component: 'DeviceScanner',
        metadata: {
          deviceId,
          deviceName: device?.name,
          deviceRssi: device?.rssi
        }
      }
    );

    await handleScanStop();
    setIsConnecting(true);

    try {
      // 기존 연결이 있다면 먼저 해제하고 완료까지 대기
      if (bleState.isConnected) {
        audit.logInfo('기존 연결 해제 중', {
          actionId,
          data: { currentDevice: bleState.connectedDevice?.id }
        });

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
        audit.endAction(actionId, ActionResult.FAILURE, {
          error: {
            message: result.error
          }
        });
        dialog.showError('연결 실패', result.error);
      } else {
        audit.endAction(actionId, ActionResult.SUCCESS, {
          metadata: {
            connectionTime: new Date().toISOString()
          }
        });
      }

    } catch (error) {
      audit.endAction(actionId, ActionResult.FAILURE, {
        error: {
          message: error?.error ?? '기기 스캔을 재시도해 보시기 바랍니다.'
        }
      });
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
            <h3 className="text-primary font-bold">마지막 연결한 기기</h3>
            <Button
              onClick={clearDeviceHistory}
              appearance="outlined"
              mode="error"
              icon="Trash2"
              size="xs"
            >
              지우기
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
          <h3 className="text-primary font-bold">찾은 기기 목록</h3>
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
            <Button onClick={()=>{bleState.connectedDevice = { id: 'tet', name: 'KOABP-TPx1-',  rssi: -10, advertisement: 'hooo', batteryLevel: (new Date().getTime()%80+15)}; disconnect()}}>con</Button>
            <Button onClick={()=>{bleState.connectedDevice = null; disconnect()}}>discon</Button>
          </HStack>
      </VStack>
    </VStack>
  )
}