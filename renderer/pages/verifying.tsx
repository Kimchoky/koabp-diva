import Image from "next/image";
import DeviceScanner from "../components/DeviceScanner";
import BleStateIndicator from "../components/BleStateIndicator";
import React from "react";
import {HStack, VStack} from "../components/ui/Stack";
import Divider from "../components/ui/Divider";
import {useAuth} from "../contexts/AuthContext";
import Header from "../components/Header";


export default function VerifyingPage() {

  const auth = useAuth();


  return (
    <VStack gap={2}>

      {/* Header */}

      <Header />


      {/* Content */}
      <HStack gap={3}>

        {/* Content-Left */}
        <div className="w-[350px] py-4">
          <DeviceScanner />
        </div>

        <Divider vertical />

        {/* Content-Right */}
        <div className="flex-grow py-4">



        </div>

      </HStack>

    </VStack>
  )

}