import Image from "next/image";
import DeviceScanner from "../components/DeviceScanner";
import BleStateIndicator from "../components/BleStateIndicator";
import {Bluetooth, MessageSquareWarning} from "lucide-react";
import React from "react";
import DialogDemo from "../components/DialogDemo";
import ActivityIndicator from "../components/ui/ActivityIndicator";
import Button from "../components/ui/Button";


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

      <ActivityIndicator.Squares width={'2em'} height={'2em'} />
      <ActivityIndicator.LegacySpinner width={'2em'} height={'2em'} />

      <Button loading>오예</Button>


    </div>
  )

}