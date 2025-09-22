import {useBLE} from "../contexts/BLEContext";

export default function BleStateIndicator() {

  const {bleState} = useBLE();

  return (
    bleState.state === 'poweredOn' ? (
      <div>🟢</div>
    ) : (
      <div>🔴</div>
    )
  )
}