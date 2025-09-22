import Button from "./ui/Button";
import {useBLE} from "../contexts/BLEContext";
import React, {useState} from "react";

export default function DeviceScanner() {

  const { bleState, startScan, connect, disconnect, discoverServices } = useBLE();

  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('')
  const [writeDataInput, setWriteDataInput] = useState<string>('')
  const [subscribedCharacteristics, setSubscribedCharacteristics] = useState<Set<string>>(new Set())


  const handleScanStart = async () => {
    await startScan(10000) // 10초 스캔
  }

  const handleConnect = async () => {
    if (selectedDevice) {
      await connect(selectedDevice)
    }
  }

  const handleDiscoverServices = async () => {
    await discoverServices()
  }

  return (
    <div>
      <Button onClick={handleScanStart}>기기 스캔</Button>

      <div>
        <div>검색된 기기 목록</div>
        { bleState.services.length > 0 ? (
          <ul>
            { bleState.services.map((service) =>
              service.characteristics.map((char) => (
                <li key={char.uuid} value={char.uuid}>
                  {char.uuid} [{char.properties.join(', ')}]
                </li>
              ))
            )}
          </ul>
        ) : (
          <div></div>
        )}

      </div>
    </div>
  )
}