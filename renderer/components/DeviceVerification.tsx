import React, {useMemo, useState} from "react";
import {HStack, VStack} from "./ui/Stack";
import Button from "./ui/Button";
import {useBLE} from "../contexts/BLEContext";
import Divider from "./ui/Divider";
import RoundedRadio from "./ui/RoundedRadioGroup";
import {LucideInfo} from "lucide-react";
import Tooltip from "./ui/Tooltip";
import {useDialog} from "../contexts/DialogContext";
import {useSession} from "../contexts/SessionContext";
import {postVerificationValues} from "../lib/queries";

const nonImprintedNames = ['KOABP-KB1-', 'KOABP-CA1-', 'KOABP-TP1-', 'KOABP-CP1-'];

export default function DeviceVerification({ enabled }: { enabled?: boolean }) {

  const {uiState} = useSession();
  const {bleState, commandSender} = useBLE();
  const dialog = useDialog();

  const [verificationValues, setVerificationValues] = useState<VerificationValuesType>({
    'vrf-pns': { pass: null, description: '' },
    'vrf-mic': { pass: null, description: '' },
    'vrf-chrg': { pass: null, description: '' },
    'vrf-cuff': { pass: null, description: '' },
    'vrf-orm': { pass: null, description: '' },
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
    { name: 'Pump & Solenoid', key: 'vrf-pns', action: commandSender.sendVerifyPumpSolenoid },
    { name: 'MIC', key: 'vrf-mic', action: commandSender.sendVerifyMic },
    { name: 'Charger', key: 'vrf-chrg', action: commandSender.sendVerifyBattCharger },
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

  const handleChangeVerificationValues = (key: VerificationKeyType, item: keyof VerificationResultType, value: any ) => {
    console.log(`Changed ${key} > ${item} >>`, value);
    setVerificationValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [item]: value
      }
    }));
  }

  const handleSaveVerificationValues = () => {
    postVerificationValues(bleState.connectedDevice.id, verificationValues)
      .then(res => {
        console.log(res);
        dialog.showSuccess('저장 성공', '검사 결과를 성공적으로 저장하였습니다.');
      })
      .catch(() => {
        dialog.showError('저장 실패', '데이터를 저장하지 못하였습니다.');
      })
  }

  return (
    <VStack gap={8}>
      <HStack gap={2} alignItems={"baseline"} justifyContent={"space-between"}>
        <div>
          <h3 className={"text-primary font-bold pb-4 inline"}>기기 검사</h3>
          <Tooltip
            position="bottomLeft"
            delay={0}
            content={
              <div>
                <h5 className="font-bold my-2">검사 방법</h5>
                <div>
                  <p>Factory Mode로 진입하고, 각 검사항목 버튼을 클릭합니다.</p>
                  <p>결과가 확인되면 검사 결과(Pass/Fail)를 선택하고 결과 저장 버튼을 클릭합니다.
                  </p>
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
            { uiState.factoryMode === 'on' && <span className={"font-bold text-green-500"}>ON</span> }
            { uiState.factoryMode === 'off' && <span className={"font-bold text-red-500"}>OFF</span> }
            { uiState.factoryMode === 'unknown' && <span className={"font-bold text-gray-500"}>Unknown</span> }
          </div>
          <Divider vertical />
          <div className={"flex"}>
            <Button mode="success" onClick={handleFactoryModeOn} disabled={isDisabled}>On</Button>
            <Button mode="error" onClick={handleFactoryModeOff} disabled={isDisabled}>Off</Button>
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
                  { item.action ? (
                      <Button mode="primary" onClick={item.action} className="w-full" disabled={isDisabled}>{item.name}</Button>
                    ):(
                      item.name
                    )
                  }
                </td>
                <td className="border border-gray-300 dark:border-gray-600">
                  <div className={"flex justify-center"}>
                  <RoundedRadio.Group
                    value={verificationValues[item.key]?.pass}
                    onChange={(v) => handleChangeVerificationValues(item.key, 'pass', v)}
                    name={item.key}
                    className={"w-40 self-center"}
                  >
                    <RoundedRadio.Item
                      value={true}
                      className={verificationValues[item.key]?.pass === true ? 'bg-green-500 dark:bg-green-500 disabled:bg-green-700 disabled:dark:bg-green-500/25' : ''}
                      disabled={isDisabled}
                    >
                      Pass
                    </RoundedRadio.Item>
                    <RoundedRadio.Item
                      value={false}
                      className={verificationValues[item.key]?.pass === false ? 'bg-red-500 disabled:bg-red-500/25' : ''}
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
                    onChange={e => handleChangeVerificationValues(item.key, 'description', e.target.value)}
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
          onClick={handleSaveVerificationValues}
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