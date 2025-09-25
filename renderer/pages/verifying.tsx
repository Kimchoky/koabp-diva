import Image from "next/image";
import DeviceScanner from "../components/DeviceScanner";
import BleStateIndicator from "../components/BleStateIndicator";
import React from "react";
import {HStack, VStack} from "../components/ui/Stack";


export default function VerifyingPage() {

  return (
    <VStack>

      {/* Header */}

      <div className="flex items-baseline gap-2">
        {/*<Image src={'/images/koabp-diva-logo-white.png'} alt={'logo'} width={128} height={50} />*/}
        <div className="text-primary">KoaBP DIVA</div>
        <div>Version: {"1.0.0"}</div>
        <BleStateIndicator />
      </div>


      {/* Content */}
      <HStack gap={10}>

        {/* Content-Left */}
        <div className={'w-[400px]'}>
          <DeviceScanner />
        </div>

        {/* Content-Right */}
        <div className={'flex-grow'}>
          <VStack className="bg-amber-50">
            CONTENTS
          </VStack>
        </div>

      </HStack>

    </VStack>
  )

}