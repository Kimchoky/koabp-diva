import React, {useEffect, useMemo, useRef, useState} from "react";
import BleStateIndicator from "./BleStateIndicator";
import {HStack, VStack} from "./ui/Stack";
import {useAuth, UserInfo} from "../contexts/AuthContext";
import Divider from "./ui/Divider";
import Button from "./ui/Button";
import {X} from "lucide-react";


const UserMenu = ({ setShowUserMenu }: { setShowUserMenu: (_:boolean)=>void}) => {

  const [timeElapsed, setTimeElapsed] = useState(0);
  const timeIntervalRef = useRef(null);
  const auth = useAuth();

  // 시간을 human-readable 형태로 변환
  const formatElapsedTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    const parts = [];

    if (days > 0) parts.push(`${days}일`);
    if (remainingHours > 0) parts.push(`${remainingHours}시간`);
    if (remainingMinutes > 0) parts.push(`${remainingMinutes}분`);
    if (remainingSeconds > 0 && parts.length < 3) parts.push(`${remainingSeconds}초`);

    // 최대 3개 단위까지 표시
    return parts.slice(0, 3).join(' ') || '0초';
  };

  const handleLogout = () => {
    auth.logout();
  }

  useEffect(() => {
    timeIntervalRef.current = window.setInterval(()=>{
      const loginTime = auth?.user?.loginTime || new Date()
      const t = new Date().getTime() - loginTime.getTime();
      setTimeElapsed(t)
    }, 1000)

    return () => {
      window.clearInterval(timeIntervalRef.current);
    }
  }, []);

  return (
    <VStack appearance="surface"
            alignItems="center"
            gap={2}
            className="absolute right-0 top-full mt-2 max-h-150 shadow-lg z-50 overflow-y-auto border border-gray-500 w-max min-w-64">
      <X className="self-end cursor-pointer" onClick={()=> setShowUserMenu(false) }/>
      <VStack alignItems={"flex-start"} className="w-full text-sm" gap={1}>
        <HStack gap={1}>
          <span className="w-[5em]">로그인 시각</span>
          <Divider vertical/>
          <span>{auth?.user?.loginTime?.toLocaleString()}</span>
        </HStack>
        <HStack gap={1}>
          <span className="w-[5em]">세션 시간</span>
          <Divider vertical/>
          <span>{formatElapsedTime(timeElapsed)}</span>
          </HStack>
      </VStack>
      <Divider />
      <Button mode="error" size="sm" className="w-full" onClick={handleLogout}>로그아웃</Button>
    </VStack>
  )
}

export default function Header() {

  const auth = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack gap={2} className="flex items-baseline">
        <span className="text-xl text-primary">KoaBP DIVA</span>
        <span className="text-sm">Version: {"1.0.0"}</span>
        <BleStateIndicator/>

      </HStack>


      <HStack gap={2} className="">
        <div className="relative">
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setShowUserMenu(true)}
          >
            사용자: {auth.user?.name}
          </span>
          { showUserMenu &&
            <UserMenu user={auth?.user} setShowUserMenu={setShowUserMenu} />
          }
        </div>
      </HStack>

    </HStack>
  )
}