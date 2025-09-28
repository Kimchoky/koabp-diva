import {useSession} from "../contexts/AuthContext";
import {HStack, VStack} from "./ui/Stack";

export default function SessionStatus() {

  const {user} = useSession();

  return (
    <div>
      <h3>작업 세션</h3>
      <HStack gap={2} justifyContent="center">
        <VStack justifyContent="center" alignItems="center">
          <div>작업 건수</div>
          <div className={`font-bold text-[2em] text-primary`}>{user.workCount}</div>
        </VStack>
      </HStack>
    </div>
  )

}