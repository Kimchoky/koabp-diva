import {HStack, VStack} from "./ui/Stack";
import {useRouter} from "next/router";
import {useAuth} from "../contexts/AuthContext";


export default function UserList() {

  const router = useRouter();
  const auth = useAuth();

  // TODO: Link API
  const users = [
    {
      name: '신라면',
      lastLogin: `11 시간 전`
    },
    {
      name: '고등어 구이',
      lastLogin: `12분 전`
    },
    {
      name: '팔도 비빔면',
      lastLogin: `🟢 접속 중`
    }
  ]


  const handleLogin = (user) => {
    // TODO: auth context

    auth.login(user)



    router.replace('/verifying');
  }

  return (
    <VStack className={"w-60"} gap={10}>

      <div className={"text-2xl"}>로그인:</div>
      <VStack gap={5}>

        {users.map((user) => (
          <HStack
            key={user.name}
            appearance="outlined"
            justifyContent={"space-between"}
            gap={10}
            className={"hover:border-primary hover:opacity-100 cursor-pointer"}
            onClick={()=>handleLogin(user)}
          >
            <div>{user.name}</div>
            <div>{user.lastLogin}</div>
          </HStack>
        ))}

      </VStack>
    </VStack>
  )


}