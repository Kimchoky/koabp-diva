import Image from "next/image";
import DeviceScanner from "../components/DeviceScanner";
import BleStateIndicator from "../components/BleStateIndicator";
import React from "react";


export default function VerifyingPage() {

  return (
    <div>
      <div className="flex items-baseline gap-2">
        {/*<Image src={'/images/koabp-diva-logo-white.png'} alt={'logo'} width={128} height={50} />*/}
        <div className="text-primary">KoaBP DIVA</div>
        <div>Version: {"1.0.0"}</div>
        <BleStateIndicator />
      </div>

      <DeviceScanner />




    </div>
  )

}