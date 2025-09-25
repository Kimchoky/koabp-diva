import {useState} from "react";

export default function DeviceVerification() {

  // 기기이름(KOABP-KB-...)이 기록되었는지. 최우선으로 적용해야 하는 작업
  const [deviceNameImprinted, setDeviceNameImprinted] = useState<boolean>(false);

  return (
    <div>



    </div>
  )

}