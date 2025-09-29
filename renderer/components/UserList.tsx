import {HStack, VStack} from "./ui/Stack";
import {useRouter} from "next/router";
import {useSession} from "../contexts/SessionContext";
import {useApi} from "../hooks/useApi";
import {useEffect, useState} from "react";
import SettingsMenu from "./SettingsMenu";
import Divider from "./ui/Divider";
import {getUsers, postLogin} from "../lib/queries";
import {UserInfo} from "../types/api";


export default function UserList() {

  const router = useRouter();
  const auth = useSession();
  const api = useApi();

  const [users, setUsers] = useState<UserInfo[]>([]);


  const handleFetchUsers = async () => {
    const users = await getUsers();
    console.log(users);
    setUsers(users);
  }


  const handleLogin = (user) => {
    // TODO: auth context

    auth.login(user)

    router.replace('/verifying');
  }

  useEffect(() => {
    handleFetchUsers()
  }, []);

  return (
    <div>
      <VStack className={"w-96 mb-20"} gap={2}>

        <h1>로그인</h1>
        <Divider/>
        <VStack gap={5}>

          {users.map((user) => (
            <HStack
              key={user.name}
              appearance="outlined"
              justifyContent={"space-between"}
              gap={10}
              className={"hover:border-primary hover:opacity-100 cursor-pointer"}
              onClick={() => handleLogin(user)}
            >
              <div>{user.name}</div>
              {user.lastLogin ?
                <>
                  <Divider vertical/>
                  <div className={"flex flex-col"}>
                    <div className={"text-gray-500 self-end"}>마지막 로그인</div>
                    <div>{new Date(user.lastLogin).toLocaleString()}</div>
                  </div>
                </>
                :
                <div></div>
              }
            </HStack>
          ))}

        </VStack>
      </VStack>
    </div>
  )


}