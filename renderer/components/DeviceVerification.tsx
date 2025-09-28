import React, {useMemo, useState} from "react";
import {HStack, VStack} from "./ui/Stack";
import Button from "./ui/Button";
import {useBLE} from "../contexts/BLEContext";
import Divider from "./ui/Divider";
import RoundedRadio from "./ui/RoundedRadioGroup";
import {LucideInfo} from "lucide-react";
import Tooltip from "./ui/Tooltip";

const nonImprintedNames = ['KOABP-KB1-', 'KOABP-TP1-', 'KOABP-CP1-'];

type VerificationKeyType = 'vrf-pns' | 'vrf-mic' | 'vrf-chrg' | 'vrf-cuff' | 'vrf-orm'
type VerificationValueType = true | false | null;
interface VerificationItem {
  name: string;
  key: VerificationKeyType;
}
export default function DeviceVerification({ enabled }: { enabled?: boolean }) {

  const {bleState, commandSender} = useBLE();

  const [factoryMode, setFactoryMode] = useState<boolean|null>(null);
  const [verificationValues, setVerificationValues] = useState<Record<VerificationKeyType, VerificationValueType>>({
    'vrf-pns': null,
    'vrf-mic': null,
    'vrf-chrg': null,
    'vrf-cuff': null,
    'vrf-orm': null,
  });

  // 기기이름(KOABP-KB-...)이 기록되었는지. 최우선으로 적용해야 하는 작업
  const deviceNameImprinted = useMemo<boolean>(()=>{
    const name = bleState?.connectedDevice?.name;
    return name && !nonImprintedNames.includes(name);
  }, [bleState.connectedDevice]);

  const isDisabled = useMemo<boolean>(()=>{
    return !bleState.connectedDevice || !bleState.communicationHealthy || !deviceNameImprinted
  }, [bleState.connectedDevice, bleState.communicationHealthy, deviceNameImprinted]);

  const verificationItems: VerificationItem[] = [
    { name: 'Pump & Solenoid', key: 'vrf-pns' },
    { name: 'MIC', key: 'vrf-mic' },
    { name: 'Charger', key: 'vrf-chrg' },
    { name: '커프 누기 시험', key: 'vrf-cuff' },
    { name: '정격 초과 측정', key: 'vrf-orm' },
  ]

  const handleFactoryModeOn = () => {
    commandSender.sendFactoryModeOn();
  }
  const handleFactoryModeOff = () => {
    commandSender.sendFactoryModeOff();
  }

  const handleBpStart = () => {
    commandSender.sendBpStart();
  }
  const handleBpStop = () => {
    commandSender.sendBpStop();
  }
  const handleImprint = () => {
    commandSender.sendImprintDeviceName(1);
  }

  const handlePassFail = (key: VerificationKeyType, val: string|number|boolean) => {
    setVerificationValues(prev => {
      const newValues = { ...prev }
      newValues[key] = typeof val === 'boolean' ? val : (val === 'true')
      return newValues
    })
  }

  return (
    <VStack gap={8}>
      <HStack gap={2} alignItems={"baseline"} justifyContent={"space-between"}>
        <div>
          <h3 className={"pb-4 inline"}>기기 검사</h3>
          <Tooltip
            position="bottomLeft"
            delay={0}
            content={
              <div>
                <h5 className="font-bold">검사 방법</h5>
                <div>
                  <p>Factory Mode로 진입하고, 각 검사항목 버튼을 클릭합니다.</p>
                  <p>결과가 확인되면 검사결과를 선택하고 결과저장 버튼을 클릭합니다.</p>
                </div>
              </div>
            }
          >
            <LucideInfo size={'1em'} className={"inline ml-2"}/>
          </Tooltip>
        </div>
        <HStack gap={4}>
          <h4>Factory Mode : </h4>
          <div>
            { factoryMode === true && <span>ON</span> }
            { factoryMode === false && <span>OFF</span> }
            { factoryMode === null && <span>Unknown</span> }
          </div>
          <Divider vertical />
          <div className={"flex"}>
            <Button mode="success" onClick={handleFactoryModeOn}>On</Button>
            <Button mode="error" onClick={handleFactoryModeOff}>Off</Button>
          </div>
        </HStack>
      </HStack>

      <VStack className="ml-8" gap={5}>
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium w-52">
                검사 항목
              </th>
              <th className="border border-gray-300 dark:border-gray-600 py-2 text-center font-medium w-48">
                검사 결과
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium">
                특이사항
              </th>
            </tr>
          </thead>
          <tbody>
            {verificationItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                  <Button mode="primary" className="w-full">{item.name}</Button>
                </td>
                <td className="border border-gray-300 dark:border-gray-600">
                  <div className={"flex justify-center"}>
                  <RoundedRadio.Group
                    value={verificationValues[item.key]}
                    onChange={(v) => handlePassFail(item.key, v)}
                    name={item.key}
                    className={"w-40 self-center"}
                  >
                    <RoundedRadio.Item
                      value={true}
                      className={verificationValues[item.key] === true ? 'bg-green-500 dark:bg-green-500 disabled:bg-green-700 disabled:dark:bg-green-500/25' : ''}
                      disabled={isDisabled}
                    >
                      Pass
                    </RoundedRadio.Item>
                    <RoundedRadio.Item
                      value={false}
                      className={verificationValues[item.key] === false ? 'bg-red-500 disabled:bg-red-500/25' : ''}
                      disabled={isDisabled}
                    >
                      Fail
                    </RoundedRadio.Item>
                  </RoundedRadio.Group>
                  </div>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    placeholder="특이사항 입력..."
                    disabled={isDisabled}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Button
          mode="success"
          size={"md"}
          disabled={isDisabled}
          className={"self-end min-w-12 w-1/3"}
        >
          결과 저장
        </Button>
      </VStack>

      <VStack className={"ml-8 hidden"}>
        <HStack>
          <span>Bp</span>
          <Button onClick={handleBpStart}>가압</Button>
          <Button onClick={handleBpStop}>감압</Button>
        </HStack>
      </VStack>
    </VStack>
  )
}