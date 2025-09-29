import {useSession} from "../contexts/SessionContext";
import {HStack, VStack} from "./ui/Stack";

export default function SessionStatus() {

  const {session} = useSession();

  return (
    <div>
      <h3>작업 세션</h3>
      <HStack gap={2} justifyContent="center">
        <VStack justifyContent="center" alignItems="center">
          <div>작업 건수</div>
          <div className={`font-bold text-[2em] text-primary`}>{session.workCount}</div>
        </VStack>
      </HStack>
    </div>
  )

}