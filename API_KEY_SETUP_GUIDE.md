# API 시크릿 키 관리 시스템 가이드

electron-keytar를 사용하여 API 시크릿 키를 OS 보안 저장소에 안전하게 관리하는 시스템입니다.

## 📋 시나리오

### 1. 앱 최초 실행
- 사용자가 설치된 앱을 처음 실행합니다.
- 앱은 `electron-keytar`를 통해 OS 보안 저장소에서 API 키를 가져오려고 시도합니다.
- 당연히 처음이므로 저장된 키가 없어 `null`을 반환받습니다.

### 2. 최초 설정 화면 표시
- 앱은 키가 없다는 것을 인지하고, 일반적인 메인 화면 대신 **최초 설정 화면**을 사용자에게 보여줍니다.
- 이 화면에는 "API 시크릿 키를 입력하세요"와 같은 입력창이 있습니다.

### 3. 키 입력 및 저장
- 사용자(관리자)는 서버의 `.env` 파일에 있는 `API_SECRET_KEY` 값을 이 입력창에 복사하여 붙여넣고 **저장** 버튼을 누릅니다.
- 앱은 입력받은 키를 `electron-keytar`를 사용해 OS의 보안 저장소에 저장합니다.
- 이 과정은 **단 한 번만** 수행됩니다.

### 4. 설정 완료 및 앱 실행
- 키가 성공적으로 저장되면, 앱은 설정 화면을 닫고 정상적인 메인 화면으로 전환됩니다.
- 이제 앱은 API 통신이 가능한 상태가 됩니다.

### 5. 두 번째 실행부터
- 사용자가 앱을 다시 실행하면, 1번 과정에서 `electron-keytar`는 OS 보안 저장소에 저장된 키를 성공적으로 가져옵니다.
- 앱은 키가 있는 것을 확인하고, **최초 설정 화면을 건너뛰고** 바로 메인 화면을 보여줍니다.
- 사용자는 더 이상 키에 대해 신경 쓸 필요가 없습니다.

## 🏗️ 구현 구조

### 1. Main 프로세스 (Node.js)

#### `main/ipc-handlers/keytar-handler.ts`
OS 보안 저장소와 통신하는 IPC 핸들러입니다.

```typescript
import { ipcMain } from 'electron';
import * as keytar from 'keytar';

const SERVICE_NAME = 'koabp-diva-app';
const ACCOUNT_NAME = 'api-secret-key';

export function registerKeytarHandlers() {
  // API 키 가져오기
  ipcMain.handle('keytar:get-api-key', async () => {
    return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  });

  // API 키 저장하기
  ipcMain.handle('keytar:set-api-key', async (_event, key: string) => {
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, key);
    return true;
  });

  // API 키 삭제하기 (선택적)
  ipcMain.handle('keytar:delete-api-key', async () => {
    return await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  });
}
```

**등록:**
`main/background.ts`에서 핸들러를 등록합니다.

```typescript
import { registerKeytarHandlers } from './ipc-handlers/keytar-handler';

// 앱 초기화 시
registerKeytarHandlers();
```

### 2. Preload (Bridge)

#### `main/preload.ts`
Renderer 프로세스에 keytar API를 안전하게 노출합니다.

```typescript
const keytarHandler = {
  getApiKey: () => ipcRenderer.invoke('keytar:get-api-key'),
  setApiKey: (key: string) => ipcRenderer.invoke('keytar:set-api-key', key),
  deleteApiKey: () => ipcRenderer.invoke('keytar:delete-api-key'),
}

contextBridge.exposeInMainWorld('keytar', keytarHandler);

export type KeytarHandler = typeof keytarHandler;
```

**타입 선언:**
`renderer/preload.d.ts`에 타입을 추가합니다.

```typescript
import { KeytarHandler } from '../main/preload';

declare global {
  interface Window {
    keytar: KeytarHandler;
  }
}
```

### 3. Renderer 프로세스 (React)

#### `renderer/components/ApiKeySetup.tsx`
API 키 입력 화면 컴포넌트입니다.

```tsx
import React, { useState } from 'react';

export default function ApiKeySetup({ onComplete }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const success = await window.keytar.setApiKey(apiKey);

    if (success) {
      onComplete(); // 설정 완료 알림
    }

    setLoading(false);
  };

  return (
    <div className="setup-screen">
      <h1>API 시크릿 키 입력</h1>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API_SECRET_KEY를 입력하세요"
      />
      <button onClick={handleSave} disabled={loading}>
        저장하고 시작
      </button>
    </div>
  );
}
```

#### `renderer/pages/_app.tsx`
앱 시작 시 API 키 존재 여부를 확인하고 분기 처리합니다.

```tsx
import { useState, useEffect } from 'react';
import ApiKeySetup from '../components/ApiKeySetup';

function App({ Component, pageProps, router }) {
  const [hasApiKey, setHasApiKey] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // 앱 시작 시 API 키 확인
  useEffect(() => {
    const checkApiKey = async () => {
      const key = await window.keytar.getApiKey();
      setHasApiKey(key !== null);
      setIsChecking(false);
    };

    checkApiKey();
  }, []);

  // 로딩 중
  if (isChecking) {
    return <div>앱을 시작하는 중...</div>;
  }

  // API 키가 없으면 설정 화면
  if (hasApiKey === false) {
    return <ApiKeySetup onComplete={() => setHasApiKey(true)} />;
  }

  // API 키가 있으면 정상 앱 실행
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}
```

## 🔐 보안 저장소 위치

`electron-keytar`는 OS의 보안 저장소에 키를 저장합니다:

- **macOS**: Keychain
- **Windows**: Credential Vault
- **Linux**: Secret Service API (libsecret)

### 식별자
- **Service Name**: `koabp-diva-app`
- **Account Name**: `api-secret-key`

이 식별자로 저장소에서 키를 찾습니다.

## 📝 사용 방법

### Renderer 프로세스에서 API 사용

```tsx
// API 키 가져오기
const apiKey = await window.keytar.getApiKey();

// API 키 저장하기
const success = await window.keytar.setApiKey('your-secret-key');

// API 키 삭제하기 (설정 초기화)
const deleted = await window.keytar.deleteApiKey();
```

### API 통신 시 키 사용

`api-client.ts` 또는 HTTP 헤더에 키를 추가하여 사용합니다.

```typescript
// 예: axios interceptor
axios.interceptors.request.use(async (config) => {
  const apiKey = await window.keytar.getApiKey();
  if (apiKey) {
    config.headers['X-API-Secret-Key'] = apiKey;
  }
  return config;
});
```

## 🔄 플로우 다이어그램

```
[앱 시작]
    ↓
[keytar.getApiKey() 호출]
    ↓
[키 존재?] ──No──> [ApiKeySetup 화면 표시]
    ↓ Yes                    ↓
    |                [키 입력 및 저장]
    |                        ↓
    |                [keytar.setApiKey()]
    |                        ↓
    └────────────────> [메인 화면 실행]
```

## ⚙️ 설정 초기화 (선택적)

사용자가 키를 재설정하고 싶을 때 사용합니다.

```tsx
// 설정 메뉴에 추가
const handleResetApiKey = async () => {
  if (confirm('API 키를 초기화하시겠습니까?')) {
    await window.keytar.deleteApiKey();
    window.location.reload(); // 앱 재시작
  }
};
```

## 🛠️ 설치 및 설정

### 1. keytar 패키지 설치

```bash
npm install keytar
```

### 2. package.json에 rebuild 스크립트 추가

```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### 3. 파일 생성 및 구현
1. `main/ipc-handlers/keytar-handler.ts` 생성
2. `main/background.ts`에 핸들러 등록
3. `main/preload.ts`에 API 노출
4. `renderer/preload.d.ts`에 타입 추가
5. `renderer/components/ApiKeySetup.tsx` 생성
6. `renderer/pages/_app.tsx`에 로직 추가

## 🧪 테스트

### Main 프로세스에서 테스트
```typescript
import * as keytar from 'keytar';

// 저장
await keytar.setPassword('koabp-diva-app', 'api-secret-key', 'test-key');

// 조회
const key = await keytar.getPassword('koabp-diva-app', 'api-secret-key');
console.log(key); // 'test-key'

// 삭제
await keytar.deletePassword('koabp-diva-app', 'api-secret-key');
```

### Renderer 프로세스에서 테스트
```tsx
// DevTools Console에서
await window.keytar.setApiKey('test-key');
await window.keytar.getApiKey(); // 'test-key'
await window.keytar.deleteApiKey();
```

## 🚨 주의사항

1. **보안**: 키는 절대 로그에 출력하지 마세요 (프로덕션 환경).
2. **에러 처리**: keytar 함수 호출 시 항상 try-catch 사용.
3. **macOS 빌드**: 코드 서명이 필요할 수 있습니다.
4. **Linux**: libsecret 라이브러리가 설치되어 있어야 합니다.

```bash
# Ubuntu/Debian
sudo apt-get install libsecret-1-dev

# Fedora
sudo dnf install libsecret-devel
```

## 📚 참고 자료

- [electron-keytar GitHub](https://github.com/atom/node-keytar)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)