import {useBLE} from "../../contexts/BLEContext";
import {HStack, VStack} from "./Stack";
import {useEffect, useRef, useState} from "react";
import {LucideTrash2} from "lucide-react";


export default function LogWindow() {

  const {logs, clearLogs} = useBLE();
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  const scrollDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logs.length > 1000) {
      // TODO: slice(length - 1000)
    }
    if (autoScrollBottom)
      scrollDivRef.current.scrollTo({ top: 1000000});
  }, [logs]);

  return (
    <VStack className="p-4">
      <HStack justifyContent="space-between">
        <p>Logs</p>

        <HStack gap={20}>

          <LucideTrash2 size={'1em'} onClick={clearLogs} className="cursor-pointer"/>

          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={autoScrollBottom}
              onChange={(e) => setAutoScrollBottom(e.target.checked)}
            />
            <span> Scroll to bottom when new log appears</span>
          </label>
        </HStack>
      </HStack>
      <VStack appearance="outlined">
        <div className="h-[230px] overflow-y-scroll" ref={scrollDivRef}>
          {logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      </VStack>
    </VStack>
  )

}