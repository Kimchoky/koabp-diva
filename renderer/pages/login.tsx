import React, {useEffect, useState} from 'react'
import Button from "../components/ui/Button";
import Link from "next/link";
import SettingsMenu from "../components/SettingsMenu";
import Divider from "../components/ui/Divider";
import {VStack} from "../components/ui/Stack";
import TextInput from "../components/ui/TextInput";
import CheckBox from "../components/ui/CheckBox";
import {postLogin} from "../lib/queries";
import {useSession} from "../contexts/SessionContext";

export default function LoginPage() {

  const session = useSession();

  const [loginError, setLoginError] = useState<boolean>(false);
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [password, setPassword] = useState("");
  const [saveEmail, setSaveEmail] = useState(!!localStorage.getItem("email"));
  const [keepLoggedIn, setKeepLoggedIn] = useState(localStorage.getItem("keepLoggedIn") === 'true');


  const handleLogin = async () => {
    session.login(email, password)
      .catch(_ => {
        setLoginError(true);
      });
  }

  useEffect(() => {
    if (saveEmail && email) {
      localStorage.setItem("email", email);
    }
    else {
      localStorage.removeItem("email");
    }

    if (keepLoggedIn) {
      localStorage.setItem('keepLoggedIn', 'true');
    }
    else {
      localStorage.removeItem('keepLoggedIn');
    }
  }, [email, saveEmail, keepLoggedIn]);

  return (

    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center animate-fade-in">

      {/*<UserList />*/}

      <VStack className={"w-96 mb-20"} gap={2}>
        <h1>로그인</h1>
        <Divider/>
        <VStack gap={5}>

          <TextInput
            label="이메일"
            placeholder="user@medicalpark.co.kr"
            value={email}
            error={loginError}
            helperText={loginError && "이메일을 확인하시기 바랍니다."}
            onChange={(e) => setEmail(e.target.value)} />
          <TextInput
            label="비밀번호"
            isPassword
            value={password}
            error={loginError}
            helperText={loginError && "비밀번호를 확인하시기 바랍니다."}
            onChange={(e) => setPassword(e.target.value)} />

          <Button mode={"primary"} size={"lg"} onClick={handleLogin}>로그인</Button>
          <Button mode={"warning"} onClick={async ()=>{session.login(email, email);}}>//DEBUG//이메일과 같은 비번으로 로그인</Button>

          <CheckBox label="이메일 저장" checked={saveEmail} onChange={e => setSaveEmail(e.target.checked)} />
          <CheckBox label="로그인 유지" checked={keepLoggedIn} onChange={e => setKeepLoggedIn(e.target.checked)} />

        </VStack>

        <div className="outline outline-amber-600 p-4 text-amber-600">
          // TODO: passwordReset:true 에 대해 비밀번호 변경화면 필요
        </div>

      </VStack>

      <div className="fixed top-8 right-8 z-50">
        <SettingsMenu/>

        <Button><Link href={"/examples/buttons"}>Buttons</Link></Button>
        <Button><Link href={"/examples/AuditUsageExamples"}>Audit</Link></Button>
        <Button onClick={async()=> { await window.keytar.setApiKey('something'); }} mode="warning" icon="Pencil">API 키 변경</Button>
        <Button onClick={async()=> { await window.keytar.deleteApiKey(); window.location.reload(); }} mode="error" icon="Trash2">API 키 삭제</Button>

      </div>



    </div>
  )
}
