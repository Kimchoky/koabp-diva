import {HStack, VStack} from "./ui/Stack";
import BatteryIndicator from "./ui/BatteryIndicator";
import Button from "./ui/Button";
import React, {useState} from "react";
import {useBLE} from "../contexts/BLEContext";
import {LucideBluetooth} from "lucide-react";

export default function DeviceConnected() {

  const { bleState, disconnect } = useBLE();

  const [showCharacteristics, setShowCharacteristics] = useState<boolean>();

  const handleDisconnect = async () => {
    await disconnect();
  }

  return (
    <VStack
        appearance={`${bleState.isConnected ? 'outlined' : 'default'}`}
        className={`${bleState.isConnected ? '!border-primary border-2' : ''}`}
      >
        {bleState.connectedDevice ? (
            <VStack gap={4} className={"p-1"}>

              {/* info */}
              <HStack justifyContent={"space-between"} alignItems={"center"}>
                <VStack gap={2}>
                  <HStack gap={2} className="text-sm text-gray-500 dark:text-gray-400">
                    <HStack appearance="outlined" gap={1} className="rounded !px-2 !py-1 bg-[#3954E0FF] text-gray-300">
                      <LucideBluetooth size="1em"/>
                      <span>연결됨</span>
                    </HStack>
                    <span className="font-bold text-xl text-primary">{bleState.connectedDevice.name}</span>
                  </HStack>

                  {/* 통신 상태 표시 */}
                  <HStack gap={2} className="text-xs">
                    <span className={`px-4 py-2 rounded
                      ${bleState.communicationHealthy
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-600 text-red-200 animate-pulse'}
                    `}>
                      {bleState.communicationHealthy ? '통신 정상' : '통신 이상'}
                    </span>
                    {bleState.lastBatteryDataTime && (
                      <span className="text-gray-500">
                        마지막 수신: {bleState.lastBatteryDataTime.toLocaleTimeString()}
                      </span>
                    )}
                  </HStack>
                </VStack>
                <BatteryIndicator level={bleState.connectedDevice.batteryLevel}/>
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
                      className="absolute right-0 top-full mt-2 w-[500px] max-h-150 shadow-lg z-50 overflow-y-auto border border-gray-500">
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
        ) : (
          <div className={"animate-fade-in-up"}>
            <VStack justifyContent={"center"} alignItems={"center"} className={""}>
                <h2 className={" animate-pulse"}>기기를 연결해주세요.</h2>
            </VStack>
          </div>
        )
        }
      </VStack>
  )
}