import {useState} from "react";
import {HStack, VStack} from "./ui/Stack";
import Button from "./ui/Button";
import {useBLE} from "../contexts/BLEContext";

export default function DeviceVerification() {

  const {bleState, commandSender} = useBLE();
  // 기기이름(KOABP-KB-...)이 기록되었는지. 최우선으로 적용해야 하는 작업
  const [deviceNameImprinted, setDeviceNameImprinted] = useState<boolean>(false);

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

  return (
    <div>

      <VStack>

        <HStack>
          <span>Factory Mode</span>
          <Button onClick={handleFactoryModeOn}>On</Button>
          <Button onClick={handleFactoryModeOff}>Off</Button>
        </HStack>

        <HStack>
          <span>Bp</span>
          <Button onClick={handleBpStart}>가압</Button>
          <Button onClick={handleBpStop}>감압</Button>
        </HStack>

      </VStack>

    </div>
  )

}