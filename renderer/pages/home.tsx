import React from 'react'
import VerifyingPage from "./verifying";

export default function HomePage() {
  // _app.tsx에서 인증 처리를 담당하므로 여기서는 단순히 메인 페이지만 렌더링
  return <VerifyingPage />;
}
