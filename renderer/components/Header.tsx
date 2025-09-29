import React, {useEffect, useMemo, useRef, useState} from "react";
import {HStack, VStack} from "./ui/Stack";
import {useSession, SessionType} from "../contexts/SessionContext";
import Divider from "./ui/Divider";
import Button from "./ui/Button";
import {LucideBluetoothOff, LucideBluetoothSearching, X} from "lucide-react";
import {useBLE} from "../contexts/BLEContext";
import Tooltip from "./ui/Tooltip";


const UserMenu = ({setShowUserMenu}: { setShowUserMenu: (_: boolean) => void }) => {

  const session = useSession();
  const {disconnect} = useBLE();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timeIntervalRef = useRef(null);

  // JWT 토큰 파싱 함수
  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT 파싱 실패:', error);
      return null;
    }
  };

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

  const handleLogout = async () => {
    await disconnect();
    session.logout();
  }

  const tokenExpiresAt = useMemo(() => {
    if (!session.session.user?.token) {
      return '';
    }
    const parsed = parseJWT(session.session.user.token)
    return parsed.exp
  }, [session.session.user.token]);

  useEffect(() => {

    const loginTime = session?.session?.loginTime || new Date()
    const t = new Date().getTime() - loginTime.getTime();
    setTimeElapsed(t)

    // JWT 토큰 파싱 및 콘솔 출력
    if (session?.session?.user?.token) {
      const parsedToken = parseJWT(session.session.user.token);
      console.log('JWT 토큰 데이터:', parsedToken);
    }

    timeIntervalRef.current = window.setInterval(() => {
      const loginTime = session?.session?.loginTime || new Date()
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
      <X className="self-end cursor-pointer" onClick={() => setShowUserMenu(false)}/>
      <VStack alignItems={"flex-start"} className="w-full text-sm" gap={1}>
        <HStack gap={1}>
          <span className="w-[5em]">로그인 시각</span>
          <Divider vertical/>
          <span>{session?.session?.loginTime?.toLocaleString()}</span>
        </HStack>
        <HStack gap={1}>
          <span className="w-[5em]">세션 시간</span>
          <Divider vertical/>
          <span>{formatElapsedTime(timeElapsed)}</span>
        </HStack>
        <HStack gap={1}>
          <span className="w-[5em]">세션 종료</span>
          <Divider vertical/>
          <span>{formatElapsedTime(tokenExpiresAt)}</span>
        </HStack>
      </VStack>
      <Divider/>
      <Button mode="error" size="sm" className="w-full" onClick={handleLogout}>로그아웃</Button>
    </VStack>
  )
}

export default function Header() {

  const session = useSession();
  const {bleState} = useBLE();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack gap={2} className="flex items-baseline">
        <span className="text-2xl text-primary">KoaBP DIVA</span>
        <span className="text-sm">{"1.0.0"}</span>

      </HStack>


      <HStack className="relative" gap={6}>

        <Tooltip
          content={bleState.state === 'poweredOn' ? 'Bluetooth 연결됨' : 'Bluetooth 연결 끊어짐'}
          position="bottom"
          delay={0}
        >
          <div >
            {bleState.state === 'poweredOn' && (
             <LucideBluetoothSearching className="text-green-600 dark:text-green-400"/>
            )}
            {bleState.state === 'poweredOff' && (
              <LucideBluetoothOff className={"text-red-600 dark:text-red-400 animate-emergency"}/>
            )}
          </div>
        </Tooltip>

        <Button
          size="sm"
          mode="primary"
          icon="User"
          appearance="contained"
          className="cursor-pointer "
          onClick={() => setShowUserMenu(true)}
        >
          {session.session.user.name}
        </Button>
        {showUserMenu &&
          <UserMenu setShowUserMenu={setShowUserMenu}/>
        }
      </HStack>

    </HStack>
  )
}