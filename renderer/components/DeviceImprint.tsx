import Divider from "./ui/Divider";
import {HStack, VStack} from "./ui/Stack";
import RoundedRadio from "./ui/RoundedRadioGroup";
import Button from "./ui/Button";
import React, {useMemo, useState} from "react";
import {useBLE} from "../contexts/BLEContext";
import {useDialog} from "../contexts/DialogContext";
import {useApi} from "../hooks/useApi";
import {getDevices, getNextDeviceSerial, postDevice} from "../lib/queries";
import Tooltip from "./ui/Tooltip";
import {LucideInfo} from "lucide-react";
import AwaitIndicator from "./AwaitIndicator";
import {useSession} from "../contexts/SessionContext";
import CheckBox from "./ui/CheckBox";

interface DeviceImprintType {
  deviceType: DeviceType;
}

const getDeviceTypeInName = (deviceType: DeviceType) => {
  switch (deviceType) {
    case "KB-1": return "KB1";
    case "CA-100": return "CA1";
    case "TP-1": return "TP1";
    case "CP-1": return "CP1";
  }
  return null;
}

export default function DeviceImprint() {

  const {bleState, commandSender, connect, disconnect, startScan} = useBLE();
  const dialog = useDialog();
  const api = useApi();
  const {uiState, setUiState} = useSession();

  const [lastImprintedSerials, setLastImprintedSerials] = useState<Record<DeviceType, string|null>>({ 'KB-1': null, 'CA-100': null, 'CP-1': null, 'TP-1': null});
  const [deviceSerial, _setDeviceSerial] = useState<string>('');  // setter는 래핑함수로 대체하고, 직접호출은 피한다.
  const [deviceType, setDeviceType] = useState<DeviceType>("KB-1");
  const [autoReconnect, setAutoReconnect] = useState(true);

  // serial setter wrapper
  const setDeviceSerial = (deviceSerial: string) => {
    if (deviceSerial.length <= 6) {
      _setDeviceSerial(deviceSerial);
    }
  }

  const imprintable = useMemo<boolean>(() => {
    const suitableName = /^[0-9A-F]+$/.test(deviceSerial)
    return bleState.connectedDevice && bleState.communicationHealthy && suitableName
  }, [deviceSerial, bleState.connectedDevice, bleState.communicationHealthy]);

  const newDeviceName = useMemo(() => (
      `KOABP-${getDeviceTypeInName(deviceType)}-${deviceSerial}`
    ), [deviceType, deviceSerial]);

  const handleGetNextSerial = async () => {
    const { nextDeviceSerial } = await getNextDeviceSerial(deviceType);
    if (nextDeviceSerial?.length > 6) {
      dialog.showError('오류', `기록할 수 없는 Serial (${nextDeviceSerial}) 입니다.\n관리자에게 문의하시기 바랍니다.`)
      return;
    }
    setDeviceSerial(nextDeviceSerial);
  }
  const decreaseCurrentSerial = () => {
    if (deviceSerial === '1') {
      dialog.showError('오류', 'Serial을 감소시킬 수 없습니다. (최소 값 도달)')
      return;
    }
    // deviceSerial을 10진수로 변환하여 가장 큰 값을 찾는다.
    const currentSerial = parseInt(deviceSerial, 16);
    // 가장 큰 값에 1을 더하고, 다시 16진수 문자열로 변환한다.
    const newSerial = (currentSerial - 1).toString(16).toUpperCase();
    setDeviceSerial(newSerial)
  }
  const increaseCurrentSerial = () => {
    if (deviceSerial === 'FFFFFF') {
      dialog.showError('오류', 'Serial을 증가시킬 수 없습니다. (최대 값 도달)')
      return;
    }
    // deviceSerial을 10진수로 변환하여 가장 큰 값을 찾는다.
    const currentSerial = parseInt(deviceSerial, 16);
    // 가장 큰 값에 1을 더하고, 다시 16진수 문자열로 변환한다.
    const newSerial = (currentSerial + 1).toString(16).toUpperCase();
    setDeviceSerial(newSerial)
  }
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 진행 단계와 메시지를 관리하는 컴포넌트
  const ProgressIndicator = ({ onClose }: { onClose: () => void }) => {
    const { bleState: currentBleState, connect: connectDevice, disconnect: disconnectDevice, startScan: scanDevices } = useBLE();
    const [currentMessage, setCurrentMessage] = useState('준비중입니다...');
    const [currentStep, setCurrentStep] = useState(0);
    const scannedDevicesRef = React.useRef(currentBleState.scannedDevices);

    const totalSteps = 5; // 전체 단계 수

    // bleState.scannedDevices 변경 감지하여 ref 업데이트
    React.useEffect(() => {
      scannedDevicesRef.current = currentBleState.scannedDevices;
    }, [currentBleState.scannedDevices]);

    const updateStep = (message: string, stepNumber: number) => {
      setCurrentMessage(message);
      setCurrentStep(stepNumber);
    };

    const rescanToConnect = async (imprintedName: string, timeout: number): Promise<boolean> => {
      await scanDevices([], timeout);
      // 스캔하면 결과가 async하게 scannedDevice에 추가되므로, 타임아웃 만큼 기다려줘야 함
      await delay(timeout + 200);

      // ref를 통해 최신 scannedDevices 가져오기
      const devices = scannedDevicesRef.current;
      const deviceToConnect = devices?.find(device => {
        return device.name === imprintedName
      });
      if (deviceToConnect) {
        await connectDevice(deviceToConnect.id);
        return true;
      }
      return false;
    };

    const runProcess = async () => {

      const imprintDevice = {
        id: currentBleState.connectedDevice.id,
        type: currentBleState.connectedDevice.type,
        name: newDeviceName,
        serial: deviceSerial,
        timestamp: Date.now(),
      }

      // 기록 커맨드를 전송하면 취소할 수 없음. 전송 전에 중복 여부 등 체크를 해야 함
      try {
        const result = await postDevice({
          deviceName: imprintDevice.name,
          deviceSerial: imprintDevice.serial,
          deviceId: imprintDevice.id,
          deviceType: imprintDevice.type,
          force: true,
        });

        setLastImprintedSerials(prev => {
          const newSerials = { ...prev };
          newSerials[imprintDevice.type] = imprintDevice.serial;
          return newSerials;
        });

      }
      catch (error) {
        console.error('postDevice failed => ', error);
        onClose();
        dialog.showError('데이터 저장 실패', '기기 데이터 저장에 실패했습니다.\n' + error?.message);
        return;
      }

      updateStep('기기에 새 이름을 기록합니다.', 1);
      await commandSender.sendImprintDeviceName(deviceType, deviceSerial);
      setUiState(prev => ({
        ...prev,
        imprintDevice
      }))
      // TODO: response 처리 ?
      await delay(1000);

      updateStep('기기 연결을 해제합니다.', 2);
      await disconnectDevice();

      updateStep('기기가 새 이름을 적용중입니다.', 3);
      await delay(8000);

      // 자동 재연결 옵션이 해제된 경우 여기서 종료함
      if (!autoReconnect) {
        onClose();
        return;
      }

      // 재연결 시도 (최대 2회)
      updateStep('기기에 연결 중: ' + imprintDevice.name, 4);

      let connected = false;
      const timeouts = [null, 1500, 2500, 3500]
      for (let attempt = 1; attempt <= 3; attempt++) {
        connected = await rescanToConnect(imprintDevice.name, timeouts[attempt]);
        if (connected) {
          break;
        }
        if (attempt < 3) {
          await delay(300); // 재시도 전 대기
        }
      }

      if (!connected) {
        onClose();
        dialog.showError('재연결 실패', `${imprintDevice.name} 기기를 찾을 수 없습니다.\n수동으로 스캔하여 연결하시기 바랍니다.`);
        return;
      }

      // 모든 단계 완료 후 대화상자 닫기
      onClose();
      dialog.showSuccess('재연결 성공', '기기를 재연결 하였습니다.')
    };

    // 컴포넌트가 마운트되면 프로세스 시작
    React.useEffect(() => {
      runProcess().catch();

    }, []);

    return (
      <AwaitIndicator
        text={currentMessage}
        duration={30}
        close={onClose}
        totalSteps={totalSteps}
        currStep={currentStep}
        width={500}
      />
    );
  };

  const handleImprint = async () => {

    // case #1. match name, match id -> 작업불필요
    // case #2. match name, diff id -> 타 기기 등록된 이름: 기록불가
    // case #3. unmatch name, match id -> 이름 업뎃할 건지 물어보기
    // case #4. unmatch name, unmatch id -> 기록가능

    const deviceId = bleState.connectedDevice.id;

    const nameMatchingDevices = await getDevices({deviceName: newDeviceName});
    const idMatchingDevices = await getDevices({deviceId: deviceId});

    try {
      await new Promise<void>((resolve, reject) => {
        if (nameMatchingDevices.length > 0) {
          const matchNameMatchId = nameMatchingDevices.find(d => d.deviceId === deviceId);

          if (matchNameMatchId) {
            // case #1: name✅ id✅ - 이미 등록된 기기, 작업 불필요
            dialog.showError('작업 불필요', '이미 등록된 기기입니다.');
            reject('case1');
          } else {
            // case #2: name✅ id❌ - 다른 기기가 이미 사용중인 이름
            dialog.showError('기기 이름 중복', '다른 기기에서 이미 사용중인 이름입니다.');
            reject('case2');
          }
        } else if (idMatchingDevices.length > 0) {
          // case #3: name❌ id✅ - 이름 업데이트 확인 필요
          dialog.showConfirm(
            '기기 이름 변경',
            `이 기기의 이름을 "${newDeviceName}"(으)로 변경하시겠습니까?`,
            () => resolve(),
            () => reject('case3_cancelled')
          );
        } else {
          // case #4: name❌ id❌ - 새로운 기기 등록 가능
          if (bleState.connectedDevice.name === newDeviceName) {
            dialog.showError('이름 동일', '현재 기기 이름과 동일합니다.');
            reject('case4_same_name');
          } else {
            resolve();
          }
        }
      });

      // 모든 검증 통과 - 진행
      dialog.showComponent(
        <ProgressIndicator onClose={() => dialog.hideComponent()} />
      );
    } catch (error) {
      console.log('Imprint cancelled or failed:', error);
    }
  }

  return (
    <div
      key="deviceConnected" className={`animate-fade-in`}
    >
      <VStack gap={8}>
        <HStack justifyContent={'space-between'} alignItems={"flex-end"}>
        <div>
          <h3 className="text-primary font-bold pb-4 inline">이름(Broadcast Name) 주입</h3>
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
        <div className={"flex items-center"}>
          <CheckBox label={"자동 재연결"} checked={autoReconnect} onChange={(e)=>setAutoReconnect(e.target.checked)} disabled={!imprintable}/>
          <Tooltip
            position="bottomRight"
            delay={0}
            content={
              <div>
                <h5 className="font-bold my-2">기록한 기기 자동 재연결</h5>
                <div>
                  <p>Broadcast Name 기록 후, 해당 기기에 연결을 시도합니다.</p>
                  <Divider/>
                  <div>연결해제 → 일정시간 대기 → 스캔 → 연결</div>
                </div>
              </div>
            }
          >
            <LucideInfo size={'1em'} className={"inline ml-2"}/>
          </Tooltip>
        </div>
        </HStack>
        <VStack gap={4} className={"ml-8"}>
          <HStack justifyContent={"space-between"}>

            <HStack gap={4}>
              <RoundedRadio.Group
                value={deviceType}
                onChange={(value: DeviceType) => setDeviceType(value)}
                name="deviceType"
                className={"w-72"}
              >
                {(['KB-1', 'CA-100', 'TP-1', 'CP-1'] as DeviceType[])
                  .map((deviceTypeValue, index) => (
                  <RoundedRadio.Item
                    key={index}
                    value={deviceTypeValue}
                    disabled={!bleState.connectedDevice || !bleState.communicationHealthy}
                    className={"text-md"}
                  >
                    <span>{deviceTypeValue}</span>
                  </RoundedRadio.Item>
                ))}
              </RoundedRadio.Group>

              <Divider vertical />

              <div className={`flex items-center`}>
                <span className={"text-xl"}>KOABP-{getDeviceTypeInName(deviceType)}-</span>
                <input
                  className={`text-2xl w-24 px-0 py-0 font-mono
                    border border-border-light dark:border-border-dark rounded focus:outline-none focus:border-2 focus:border-primary focus:dark:border-primary
                    bg-transparent text-primary disabled:text-border-light disabled:cursor-not-allowed
                  `}
                  value={deviceSerial}
                  onChange={(e) => {
                    let numericValue = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
                    // Remove leading zeros
                    numericValue = numericValue.replace(/^0+/, '');
                    setDeviceSerial(numericValue);
                  }}
                  type="text"
                  inputMode="text"
                  pattern="[0-9A-F]*"
                  maxLength={6}
                  disabled={!bleState.connectedDevice || !bleState.communicationHealthy}
                />
                <div>
                  <Tooltip delay={0} content={<div className={"pt-2"}>Serial 감소</div>}>
                    <Button appearance={"outlined"} onClick={decreaseCurrentSerial} icon="ChevronLeft" className={"ml-1"} size={"xs"} disabled={!bleState.connectedDevice || !bleState.communicationHealthy}/>
                  </Tooltip>
                  <Tooltip delay={0} content={<div className={"pt-2"}>Serial 증가</div>}>
                    <Button appearance={"outlined"} onClick={increaseCurrentSerial} icon="ChevronRight" className={"ml-1"} size={"xs"} disabled={!bleState.connectedDevice || !bleState.communicationHealthy}/>
                  </Tooltip>
                  <Tooltip delay={0} content={
                    <div className={"pt-2"}>
                      <div className={"font-bold"}>DB에서 Serial 가져오기</div>
                      <div className={"pt-2"}>각 모델 별로 DB에 저장된 Name 중, 가장 큰 값의 다음 값을 가져온다.</div>
                    </div>
                  }>
                    <Button appearance={"outlined"} mode={"warning"} onClick={handleGetNextSerial} icon="ChevronsDown" className={"ml-1"} size={"xs"} disabled={!bleState.connectedDevice || !bleState.communicationHealthy}/>
                  </Tooltip>
                </div>
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
        <div>
          { Object.keys(lastImprintedSerials).map((key, index) => (
            <span key={key}>{key}: {lastImprintedSerials[key]}</span>
          ))}
        </div>

      </VStack>
    </div>
  )
}