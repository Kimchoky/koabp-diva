import React, { useState, useEffect } from 'react'
import type {AppProps} from 'next/app'
import {BLEProvider} from '../contexts/BLEContext'
import {DialogProvider} from '../contexts/DialogContext'
import {SessionProvider, useSession} from '../contexts/SessionContext'

import '../styles/globals.css'
import {AuditProvider} from "../contexts/AuditContext";
import LoginPage from './login';
import VerifyingPage from './verifying';
import ApiKeySetup from '../components/ApiKeySetup';
import {validateApiKey} from "../lib/queries";
import {ThemeProvider} from "../components/ThemeContext";

// 로그인 상태에 따른 라우팅 컴포넌트
function AuthenticatedApp({Component, pageProps, router}: AppProps) {
  const {session} = useSession();

  // 특정 페이지는 인증 체크를 건너뛰기 (예: 예제 페이지들)
  const publicPages = ['/examples/buttons', '/examples/AuditUsageExamples'];
  const isPublicPage = publicPages.includes(router.pathname);

  // 공개 페이지는 그대로 렌더링
  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  // 로그인 여부에 따라 페이지 결정
  if (session?.user?._id) {
    // 로그인된 경우 - verifying 페이지 또는 요청된 컴포넌트
    if (router.pathname === '/home' || router.pathname === '/') {
      return <VerifyingPage />;
    }
    return <Component {...pageProps} />;
  } else {
    // 로그인되지 않은 경우 - login 페이지
    return <LoginPage />;
  }
}

function App({Component, pageProps, router}: AppProps) {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isValidApiKey, setIsValidApiKey] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  // 앱 시작 시 API 키 존재 여부 확인
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const key = await window.keytar.getApiKey();
        const keyValid =  await validateApiKey(key);
        setHasApiKey(key !== null);
        setIsValidApiKey(keyValid);
      } catch (error) {
        console.error('Failed to check API key:', error);
        setHasApiKey(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkApiKey();
  }, []);

  // API 키 설정 완료 핸들러
  const handleApiKeySetupComplete = () => {
    setHasApiKey(true);
    setIsValidApiKey(true);
  };

  // 로딩 중
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">앱을 시작하는 중...</p>
      </div>
    );
  }

  // API 키가 있으면 정상 앱 실행
  return (
    <AuditProvider>
      <SessionProvider>
        <BLEProvider>
          <ThemeProvider>
          <DialogProvider>


            { // API 키가 없으면 설정 화면 표시
              (hasApiKey === false || isValidApiKey === false) ? (
              <ApiKeySetup onComplete={handleApiKeySetupComplete} hasApiKey={hasApiKey} isValidApiKey={isValidApiKey} />
            ) : (
              <div className="min-h-screen relative p-4">
                <AuthenticatedApp Component={Component} pageProps={pageProps} router={router} />
              </div>
            )
            }

          </DialogProvider>
          </ThemeProvider>
        </BLEProvider>
      </SessionProvider>
    </AuditProvider>

  )
}

export default App
