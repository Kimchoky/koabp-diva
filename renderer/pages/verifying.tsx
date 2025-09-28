import DeviceScanner from "../components/DeviceScanner";
import React, {useState} from "react";
import {HStack, VStack} from "../components/ui/Stack";
import {useSession} from "../contexts/AuthContext";
import Header from "../components/Header";
import {useBLE} from "../contexts/BLEContext";
import Button from "../components/ui/Button";
import DeviceConnected from "../components/DeviceConnected";
import LogWindow from "../components/ui/LogWindow";
import DeviceImprint from "../components/DeviceImprint";
import DeviceVerification from "../components/DeviceVerification";
import SessionStatus from "../components/SessionStatus";
import Divider from "../components/ui/Divider";


export default function VerifyingPage() {

  const auth = useSession();
  const {bleState, commandSender} = useBLE();

  return (
    <VStack gap={4} className="animate-fade-in">

      {/* Header */}

      <Header />


      {/* Content */}
      <HStack gap={3} alignItems={"flex-start"}>

        {/* Content-Left */}
        <VStack gap={4} className="w-[380px]">

          <VStack appearance="outlined">
            <SessionStatus />
          </VStack>

          <VStack appearance="outlined">
            <DeviceScanner />
          </VStack>

        </VStack>

        {/*<Divider vertical />*/}

        {/* Content-Right */}
        <VStack
          appearance="outlined"
          gap={2}
          className={`flex-grow`}>

          <DeviceConnected />

          <Divider />

          <DeviceImprint />

          <Divider />

          <DeviceVerification />

          <div className={"flex bg-red-200"}>
          <Button onClick={()=> {bleState.communicationHealthy = true}}>통신정상</Button>
          <Button onClick={()=> {bleState.communicationHealthy = false}}>통신오류</Button>
          </div>
        </VStack>


      </HStack>

      <LogWindow />

    </VStack>
  )

}