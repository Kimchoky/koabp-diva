import Divider from "./ui/Divider";
import {HStack, VStack} from "./ui/Stack";
import RoundedRadio from "./ui/RoundedRadioGroup";
import Button from "./ui/Button";
import React, {useMemo, useState} from "react";
import {useBLE} from "../contexts/BLEContext";
import {useDialog} from "../contexts/DialogContext";
import {useApi} from "../hooks/useApi";
import {checkDeviceNumberExists, getNextDeviceNumber} from "../lib/queries";
import Tooltip from "./ui/Tooltip";
import {LucideInfo} from "lucide-react";

interface DeviceImprintType {
  deviceType: DeviceType;
}

export default function DeviceImprint() {

  const {bleState, commandSender} = useBLE();
  const dialog = useDialog();
  const api = useApi();

  const [deviceUniqueNumbers, setDeviceUniqueNumbers] = useState<number[]>([]);
  const [deviceUniqueName, setDeviceUniqueName] = useState<string>('');
  const [deviceType, setDeviceType] = useState<DeviceType>("KB-1");


  const imprintable = useMemo<boolean>(() => {
    const suitableName = /^[0-9A-F]+$/.test(deviceUniqueName)
    return bleState.connectedDevice && bleState.communicationHealthy && suitableName
  }, [deviceUniqueName, bleState.connectedDevice, bleState.communicationHealthy]);

  const handleNextNumber = () => {
    const nextNumber = getNextDeviceNumber(deviceType);
  }
  const handleImprint = async () => {
    if (checkDeviceNumberExists(deviceUniqueName)) {
      dialog.showError('오류', '이미 등록된 번호입니다.');
      return;
    }

    // all OK.
    await commandSender.sendImprintDeviceName(deviceType, deviceUniqueName);

  }

  return (
    <div
      key="deviceConnected" className={`animate-fade-in`}
    >
      <VStack gap={8}>
        <div>
          <h3 className="pb-4 inline">Broadcast Name 주입</h3>
          <Tooltip
            position="bottomLeft"
            delay={0}
            content={
              <div>
                <h5 className="font-bold my-2">주의사항</h5>
                <div>
                  <p>ID가 전송되면 자동으로 연결이 끊어지고, </p>
                  <p>모델에 따라 기기가 꺼지거나(TP-1, CP-1) 재시작(KB-1, CA-100)됩니다.</p>
                  <p>이후 기기를 다시 스캔하여 새로운 이름의 기기를 연결하시기 바랍니다.</p>
                </div>
              </div>
            }
          >
            <LucideInfo size={'1em'} className={"inline ml-2"}/>
          </Tooltip>
        </div>
        <VStack gap={4} className={"ml-8"}>
          <HStack justifyContent={"space-between"}>

            <HStack gap={4}>
              <RoundedRadio.Group
                value={deviceType}
                onChange={(value: DeviceType) => setDeviceType(value)}
                name="deviceType"
                className={"w-60"}
              >
                {(['KB-1', 'TP-1', 'CP-1'] as DeviceType[])
                  .map((deviceTypeValue, index) => (
                  <RoundedRadio.Item
                    key={index}
                    value={deviceTypeValue}
                    disabled={!bleState.connectedDevice || !bleState.communicationHealthy}
                  >
                    <span>{deviceTypeValue}</span>
                  </RoundedRadio.Item>
                ))}
              </RoundedRadio.Group>

              <Divider vertical />

              <div className={`flex items-center`}>
                <span>KOABP-{deviceType.replace('-', '')}-</span>
                <input
                  className={`text-2xl w-28 px-2 py-1
                    border border-border-light dark:border-border-dark rounded focus:outline-none focus:border-blue-500
                    bg-transparent text-primary disabled:text-border-light disabled:cursor-not-allowed
                  `}
                  value={deviceUniqueName}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
                    setDeviceUniqueName(numericValue);
                  }}
                  type="text"
                  inputMode="text"
                  pattern="[0-9A-F]*"
                  maxLength={6}
                  disabled={!bleState.connectedDevice || !bleState.communicationHealthy}
                />
              </div>
            </HStack>

            <Button
              mode="success"
              size="md"
              onClick={handleImprint}
              disabled={!imprintable}
            >
              기기에 기록
            </Button>

          </HStack>

        </VStack>

      </VStack>
    </div>
  )
}