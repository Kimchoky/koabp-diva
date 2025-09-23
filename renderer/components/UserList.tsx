import {HStack, VStack} from "./ui/Stack";


export default function UserList() {

  // TODO: Link API
  const users = [
    {
      name: '신라면',
      lastLogin: Date.now() - (1000 * 60 * 30)
    },
    {
      name: '고등어 구이',
      lastLogin: Date.now() - (1000 * 60 * 60 * 2)
    }
  ]


  const handleLogin = (user) => {
    // TODO: auth context
  }

  return (
    <VStack className={"w-60"} gap={10}>

      <div className={"text-2xl"}>로그인:</div>
      <VStack gap={5}>

        {users.map((user) => (
          <HStack
            appearance="outlined"
            justifyContent={"space-between"}
            gap={10}
            className={"hover:border-primary hover:opacity-100 cursor-pointer"}
            onClick={()=>handleLogin(user)}
          >
            <div>{user.name}</div>
            <div>{new Date(user.lastLogin).toLocaleTimeString()}</div>
          </HStack>
        ))}

      </VStack>
    </VStack>
  )


}