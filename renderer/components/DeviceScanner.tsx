import Button from "./ui/Button";
import {useBLE} from "../contexts/BLEContext";
import React, {useState} from "react";
import {useDialog} from "../contexts/DialogContext";
import {HStack, VStack} from "./ui/Stack";
import {LucideBluetoothOff} from "lucide-react";
import Divider from "./ui/Divider";
import BatteryIndicator from "./ui/BatteryIndicator";

export default function DeviceScanner() {

  const {bleState, startScan, stopScan, connect, disconnect, discoverServices, getConnectedDevice} = useBLE();

  const dialog = useDialog();

  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('')
  const [writeDataInput, setWriteDataInput] = useState<string>('')
  const [subscribedCharacteristics, setSubscribedCharacteristics] = useState<Set<string>>(new Set())

  const [isConnecting, setIsConnecting] = useState(false);


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

    await handleScanStop();
    setIsConnecting(true);

    try {

      const connectPromise = connect(deviceId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 3 seconds')), 3000)
      );
      await Promise.race([connectPromise, timeoutPromise]);

    } catch (error) {
      dialog.showError('', '기기에 연결하지 못하였습니다.')
      console.error('C!onnection failed:', error)
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

  return (
    <VStack className="p-4" gap={10}>

      <p className="text-lg">연결된 기기</p>
      <VStack appearance="outlined">

        {bleState.connectedDevice ? (
          bleState.devices.map((device, i) => (
            <HStack key={i} justifyContent={"space-between"}>
              <VStack>
                <div className="font-medium">{device.name}</div>
                <HStack gap={5}>
                  <div className="text-sm text-gray-500">배터리: <BatteryIndicator level={device.batteryLevel}/></div>
                  <Divider vertical />
                  <div className="text-sm text-gray-500">신호세기(RSSI): {device.rssi}dBm</div>
                </HStack>

              </VStack>



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
          ))
        ) : (
          <div className="text-gray-500">연결된 기기 없음</div>
        )
        }
      </VStack>

      <Divider/>

      <VStack gap={10}>

        <HStack gap={12}>
          <Button
            onClick={handleScanStart}
            disabled={bleState.isScanning || isConnecting}
            appearance="contained"
            mode="primary"
            icon="Search"
          >
            {bleState.isScanning ? '스캔 중...' : '기기 스캔'}
          </Button>
          {bleState.isScanning && (
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

        <VStack appearance="outlined">

          <div>검색된 기기 목록</div>

          {bleState.devices.length > 0 ? (
            <div className="mt-4">
              <ul className="border rounded divide-y">
                {bleState.devices.map((device) => (
                  <li
                    key={device.id}
                    className="p-3 flex items-center justify-between hover:bg-gray-400/30"
                  >
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {device.id} | RSSI: {device.rssi}dBm
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnect(device.id)}
                      size="sm"
                      icon="Bluetooth"
                      disabled={(bleState.isConnected && bleState.connectedDevice === device.id) || isConnecting}
                    >
                      {bleState.isConnected && bleState.connectedDevice === device.id ? '연결됨' :
                        isConnecting ? '연결중' : '연결'}
                    </Button>
                  </li>
                ))}
              </ul>

              {bleState.isConnected && (
                <div className="mt-4">
                  <Button onClick={handleDiscoverServices} size="sm" appearance="outlined" icon="Search">
                    서비스 검색
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 text-gray-500">
              {bleState.isScanning ? '스캔 중...' : '스캔을 시작하여 기기를 찾으세요'}
            </div>
          )}

          {bleState.services.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold">발견된 서비스 및 특성:</div>
              <ul className="mt-2">
                {bleState.services.map((service) =>
                  service.characteristics.map((char) => (
                    <li key={char.uuid} className="p-2 border-b">
                      {char.uuid} [{char.properties.join(', ')}]
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </VStack>
      </VStack>
    </VStack>
  )
}