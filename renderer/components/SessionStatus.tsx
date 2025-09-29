import {useSession} from "../contexts/SessionContext";
import {HStack, VStack} from "./ui/Stack";
import {useMemo, useState} from "react";
import {red} from "next/dist/lib/picocolors";
import {text} from "node:stream/consumers";
import Divider from "./ui/Divider";
import {ArrowDown, ChevronDown, ChevronUp} from "lucide-react";

export default function SessionStatus() {

  const {session, increaseWorkCount} = useSession();

  const [expanded, setExpanded] = useState(false);

  const deviceTypes: DeviceType[] = ['KB-1', 'CA-100', 'TP-1', 'CP-1'];
  const workTypes: ('imprint' | 'verify')[] = ['imprint', 'verify'];

  const imprintSum = useMemo(() => {
    const reduced = Object.entries(session.works.imprint).reduce((pv, cv) => {
      return ['sum', pv[1] + cv[1]]
    })
    return reduced[1]
  }, [session.works])
  const verifySum = useMemo(() => {
    const reduced = Object.entries(session.works.verify).reduce((pv, cv) => {
      return ['sum', pv[1] + cv[1]]
    })
    return reduced[1]
  }, [session.works])


  return (
    <div>
      <HStack alignItems={"flex-start"} gap={10} className={"relative"}>
        <h3 className={"text-primary font-bold"}>작업 세션</h3>
        <HStack gap={2} justifyContent={"space-evenly"} className={"flex-grow"}>
          <div>
            <h5>이름 주입</h5>
            <div className={"text-3xl text-center"}>{imprintSum}</div>
          </div>
          <Divider vertical />
          <div>
            <h5>기기 검사</h5>
            <div className={"text-3xl text-center"}>{verifySum}</div>
          </div>
        </HStack>

        <div className={"absolute bottom-0 left-0 cursor-pointer"}>
          { expanded ? (
            <ChevronUp onClick={() => setExpanded(false)}/>
          ) : (
            <ChevronDown onClick={() => setExpanded(true)}/>
          )}
        </div>

      </HStack>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <table className={`w-full border-collapse`}>
          <thead>
            <tr className={"bg-gray-100 dark:bg-gray-800"}>
              <th className="border border-border-light dark:border-border-dark p-2">작업 유형</th>
              {deviceTypes.map(deviceType => (
                <th key={deviceType} className="border border-border-light dark:border-border-dark p-2">
                  {deviceType}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workTypes.map(workType => (
              <tr key={workType}>
                <td className={`border border-border-light dark:border-border-dark p-2 font-bold`}>
                  {workType === 'imprint' && 'Name 주입'}
                  {workType === 'verify' && '기기 검사'}
                </td>
                {deviceTypes.map(deviceType => (
                  <td key={deviceType} className="border border-border-light dark:border-border-dark p-2 text-center !font-normal">
                    {session.works[workType][deviceType]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

}