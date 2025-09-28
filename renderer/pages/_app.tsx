import React from 'react'
import type {AppProps} from 'next/app'
import {BLEProvider} from '../contexts/BLEContext'
import {DialogProvider} from '../contexts/DialogContext'
import {SessionProvider, useSession} from '../contexts/AuthContext'

import '../styles/globals.css'
import ThemeToggle from "../components/ThemeToggle";
import {AuditProvider} from "../contexts/AuditContext";
import LoginPage from './login';
import VerifyingPage from './verifying';

// 로그인 상태에 따른 라우팅 컴포넌트
function AuthenticatedApp({Component, pageProps, router}: AppProps) {
  const session = useSession();

  // 특정 페이지는 인증 체크를 건너뛰기 (예: 예제 페이지들)
  const publicPages = ['/examples/buttons', '/examples/AuditUsageExamples'];
  const isPublicPage = publicPages.includes(router.pathname);

  // 공개 페이지는 그대로 렌더링
  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  // 로그인 여부에 따라 페이지 결정
  if (session.user?.name) {
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
  return (
    <AuditProvider>
      <SessionProvider>
        <BLEProvider>
          <DialogProvider>

            <div className="min-h-screen relative p-4">
              <AuthenticatedApp Component={Component} pageProps={pageProps} router={router} />
              <ThemeToggle/>
              {/*<LogWindow/>*/}
            </div>

          </DialogProvider>
        </BLEProvider>
      </SessionProvider>
    </AuditProvider>
  )
}

export default App
