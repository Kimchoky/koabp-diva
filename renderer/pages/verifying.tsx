import DeviceScanner from "../components/DeviceScanner";
import React, {useMemo, useState} from "react";
import {HStack, VStack} from "../components/ui/Stack";
import Divider from "../components/ui/Divider";
import {useAuth} from "../contexts/AuthContext";
import Header from "../components/Header";
import {useBLE} from "../contexts/BLEContext";
import Button from "../components/ui/Button";
import Radio from "../components/ui/RadioGroup";
import TextInput from "../components/ui/TextInput";
import DeviceConnected from "../components/DeviceConnected";
import DeviceVerification from "../components/DeviceVerification";
import LogWindow from "../components/ui/LogWindow";

interface DeviceImprintType {
  deviceType: DeviceType;
}

export default function VerifyingPage() {

  const auth = useAuth();
  const {bleState, commandSender} = useBLE();
  const [deviceType, setDeviceType] = useState("type1");

  const [deviceUniqueNumbers, setDeviceUniqueNumbers] = useState<number[]>([]);
  const [deviceUniqueNumber, setDeviceUniqueNumber] = useState<number>(0);

  const imprintable = useMemo<boolean>(() => {
    return deviceUniqueNumber > 0 && bleState.communicationHealthy
  }, [deviceUniqueNumber, bleState.communicationHealthy]);

  const deviceImprints: DeviceImprintType[] = [
    { deviceType: 'KB-1' },
    { deviceType: 'TP-1' },
    { deviceType: 'CP-1' },
  ]

  const handleImprint = () => {
    commandSender.sendImprintDeviceName(22345);
  }

  return (
    <VStack gap={4} className="animate-fade-in">

      {/* Header */}

      <Header />


      {/* Content */}
      <HStack gap={3} alignItems={"flex-start"}>

        {/* Content-Left */}
        <VStack appearance="outlined" className="w-[380px]">
          <DeviceScanner />
        </VStack>

        {/*<Divider vertical />*/}

        {/* Content-Right */}
        <VStack
          appearance="outlined"
          gap={2}
          className={`flex-grow`}>

          <DeviceConnected />


          {/* react는 최종렌더링 결과를 비교하므로, 키가 없다면 내용만 바꿔치기하므로 애니메이션 효과가 나타나지 않음 */}
          <div
            key="deviceConnected"
            className={`animate-fade-in
              ${!bleState.communicationHealthy && 'animate-fade-out'}
            `}
          >
            <Divider />
            <VStack>
              <VStack gap={4}>
                <h3>기기 Name 설정</h3>
                <HStack gap={6} alignItems={'flex-end'}>
                  <VStack>
                    <Radio.Group
                      value={deviceType}
                      onChange={(value) => setDeviceType(value.toString())}
                      name="deviceType"
                      vertical
                      gap={2}
                    >
                      { deviceImprints.map((deviceImprint, index) => (
                        <Radio.Item key={index} outlined value={deviceImprint.deviceType}>
                          <HStack gap={2}>
                            <span>{deviceImprint.deviceType}</span>
                            <Divider vertical />
                            <TextInput className={"text-2xl"} disabled/>
                          </HStack>
                        </Radio.Item>
                      ))}
                    </Radio.Group>
                  </VStack>

                  <VStack>
                    asdf
                  </VStack>

                  <Button
                    mode="success"
                    size="xl"
                    onClick={handleImprint}
                    disabled={!imprintable}
                  >
                    기기에 기록
                  </Button>
                </HStack>
              </VStack>

              <Divider />

              <VStack>

                <DeviceVerification />

              </VStack>
            </VStack>
          </div>

        </VStack>


      </HStack>

      <LogWindow />

    </VStack>
  )

}