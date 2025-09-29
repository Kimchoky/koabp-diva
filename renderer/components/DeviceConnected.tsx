import {HStack, VStack} from "./ui/Stack";
import BatteryIndicator from "./ui/BatteryIndicator";
import Button from "./ui/Button";
import Tag from "./ui/Tag";
import React, {useState} from "react";
import {useBLE} from "../contexts/BLEContext";
import {LucideBluetooth, LucideWifi} from "lucide-react";
import ActivityIndicator from "./ui/ActivityIndicator";
import {useDialog} from "../contexts/DialogContext";

export default function DeviceConnected() {

  const dialog = useDialog();
  const { bleState, disconnect, commandSender } = useBLE();

  const [showCharacteristics, setShowCharacteristics] = useState<boolean>();

  const handleDisconnect = async () => {
    if (bleState.connectedDevice.type === 'TP-1') {
      // Power off 명령 전송
      await commandSender.sendTpPowerOff();
      await disconnect();
    }
    else if (bleState.connectedDevice.type === 'CP-1') {
      await commandSender.sendCpPowerOff();
      await disconnect();
    }
    else {
      await disconnect();
    }
  }

  const DeviceInfoSection = ({className}) => {
    return (
      <VStack gap={2} className={className}>
        <HStack gap={2} alignItems={"flex-start"} className="text-sm text-gray-500 dark:text-gray-400">
          <Tag variant="primary" size="sm" icon={<LucideBluetooth size="1em"/>} className="w-24">
            연결됨
          </Tag>
          <div className="font-bold text-xl text-primary">{bleState.connectedDevice.name}</div>
        </HStack>

        {/* 통신 상태 표시 */}
        <HStack gap={2} className="text-xs">
          <Tag
            variant={bleState.communicationHealthy ? 'success' : 'error'}
            size="sm"
            icon={<LucideWifi size="1em"/>}
            animate={!bleState.communicationHealthy}
            className="w-24"
          >
            {bleState.communicationHealthy ? '통신 정상' : '통신 이상'}
          </Tag>
          {bleState.lastBatteryDataTime && (
            <span className="text-gray-500">
              마지막 수신: {bleState.lastBatteryDataTime.toLocaleTimeString()}
            </span>
          )}
        </HStack>
      </VStack>
    )
  }


  const ButtonSection = ({className}) => {
    return (
      <HStack justifyContent={"space-between"} gap={2} className={className}>

        <div className="text-sm text-gray-500">ID: {bleState.connectedDevice.id}</div>

        <HStack gap={2} alignItems={"flex-end"}>
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
      </HStack>
    )
  }

  return (
    <VStack
        appearance={`${bleState.isConnected ? 'outlined' : 'default'}`}
        className={`${bleState.isConnected ? '!border-primary border-2' : ''}`}
      >
        {bleState.connectedDevice ? (
            <VStack gap={4} className={"p-1"}>
              <HStack justifyContent={"space-between"} alignItems={"center"}>
                <DeviceInfoSection className={""} />
                <BatteryIndicator level={bleState.connectedDevice.batteryLevel}/>
              </HStack>
              <ButtonSection className={""}/>
            </VStack>
        ) : (
          <div className={"animate-fade-in-up"}>
            <VStack justifyContent={"center"} alignItems={"center"} className={""}>
                <ActivityIndicator.TextGradient
                  palette={"red"}
                  className={"font-bold text-[2rem] animate-pulse"}
                >
                  기기를 연결해주세요
                </ActivityIndicator.TextGradient>
            </VStack>
          </div>
        )
        }
      </VStack>
  )
}