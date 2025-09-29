# Queries API 사용 가이드

`queries.ts`는 모든 API 호출을 중앙에서 관리하는 통합 API 레이어입니다.

## 🎯 주요 장점

1. **중앙 관리**: 모든 API 엔드포인트를 한 곳에서 관리
2. **타입 안정성**: TypeScript로 완전한 타입 체크
3. **재사용성**: 컴포넌트 간 API 로직 공유
4. **유지보수**: 엔드포인트 변경 시 한 곳만 수정

## 📦 제공되는 API

### BLE Devices API

#### 1. 디바이스 목록 조회 (필터 지원)

```tsx
import { useDevices } from '@/lib/queries';

function DeviceList() {
  const { data, loading, error, refetch } = useDevices({ deviceType: 'KB-1' });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map(device => (
          <li key={device.id}>
            {device.name} - {device.deviceType}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 2. 특정 디바이스 조회 (이름으로)

```tsx
import { useDeviceByName } from '@/lib/queries';

function DeviceDetail() {
  const { data, loading } = useDeviceByName('KOABP-KB1-5302');

  return (
    <div>
      {data && (
        <div>
          <h2>{data.name}</h2>
          <p>Type: {data.deviceType}</p>
          <p>Author: {data.author}</p>
        </div>
      )}
    </div>
  );
}
```

#### 3. 디바이스 등록

```tsx
import { useCreateDevice } from '@/lib/queries';

function RegisterDevice() {
  const { mutate, loading } = useCreateDevice({
    onSuccess: (device) => {
      alert(`Device ${device.name} registered successfully!`);
    },
    onError: (error) => {
      alert(`Failed: ${error.message}`);
    }
  });

  const handleRegister = async () => {
    await mutate({
      deviceName: 'KOABP-KB1-5302',
      deviceId: 'unique-device-id',
      deviceType: 'KB-1'
    });
  };

  return (
    <button onClick={handleRegister} disabled={loading}>
      {loading ? 'Registering...' : 'Register Device'}
    </button>
  );
}
```

#### 4. 디바이스 수정

```tsx
import { useUpdateDevice } from '@/lib/queries';

function EditDevice() {
  const { mutate, loading } = useUpdateDevice({
    onSuccess: (device) => console.log('Updated:', device)
  });

  const handleUpdate = async () => {
    await mutate({
      name: 'KOABP-KB1-5302',
      data: { deviceType: 'CA-1' }
    });
  };

  return (
    <button onClick={handleUpdate} disabled={loading}>
      Update Device
    </button>
  );
}
```

#### 5. 디바이스 삭제

```tsx
import { useDeleteDevice } from '@/lib/queries';

function DeleteDevice() {
  const { mutate, loading } = useDeleteDevice({
    onSuccess: () => alert('Device deleted')
  });

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await mutate('KOABP-KB1-5302');
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      Delete Device
    </button>
  );
}
```

#### 6. 디바이스 번호 중복 확인 (Helper 함수)

```tsx
import { checkDeviceNumberExists } from '@/lib/queries';

async function validateDeviceNumber(deviceNumber: string) {
  const exists = await checkDeviceNumberExists(deviceNumber);

  if (exists) {
    alert('This device number already exists!');
    return false;
  }

  return true;
}
```

#### 7. 다음 사용 가능한 디바이스 번호 가져오기 (Helper 함수)

```tsx
import { getNextDeviceNumber } from '@/lib/queries';

async function getSuggestedDeviceNumber() {
  const nextNumber = await getNextDeviceNumber('KB-1');
  console.log('Next available number:', nextNumber); // 예: "5303"
  return nextNumber;
}
```

### 실전 예제: 디바이스 등록 폼

```tsx
import React, { useState } from 'react';
import {
  useCreateDevice,
  checkDeviceNumberExists,
  getNextDeviceNumber
} from '@/lib/queries';

function DeviceRegistrationForm() {
  const [deviceType, setDeviceType] = useState<DeviceType>('KB-1');
  const [deviceNumber, setDeviceNumber] = useState('');

  const { mutate, loading, error } = useCreateDevice({
    onSuccess: (device) => {
      alert(`Device ${device.name} registered!`);
      setDeviceNumber('');
    }
  });

  const handleGetNextNumber = async () => {
    const nextNumber = await getNextDeviceNumber(deviceType);
    setDeviceNumber(nextNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 중복 확인
    const deviceName = `KOABP-${deviceType.replace('-', '')}-${deviceNumber}`;
    const exists = await checkDeviceNumberExists(deviceName);

    if (exists) {
      alert('This device number already exists!');
      return;
    }

    // 등록
    await mutate({
      deviceName,
      deviceId: `device-${Date.now()}`,
      deviceType
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Device Type:</label>
        <select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value as DeviceType)}
        >
          <option value="KB-1">KB-1</option>
          <option value="TP-1">TP-1</option>
          <option value="CP-1">CP-1</option>
          <option value="CA-1">CA-100</option>
        </select>
      </div>

      <div>
        <label>Device Number:</label>
        <input
          type="text"
          value={deviceNumber}
          onChange={(e) => setDeviceNumber(e.target.value.toUpperCase())}
          placeholder="5302"
          pattern="[0-9A-F]+"
          required
        />
        <button type="button" onClick={handleGetNextNumber}>
          Get Next Number
        </button>
      </div>

      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Device'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

## 📊 BLE Device 타입 정의

```tsx
// Device Type
type DeviceType = 'KB-1' | 'TP-1' | 'CP-1' | 'CA-100';
type DeviceTypeAlias = 'KB1' | 'TP1' | 'CP1' | 'CA1';

// API 응답
interface BLEDeviceData {
  id: string;
  name: string;              // 예: "KOABP-KB1-5302"
  deviceId: string;
  deviceType: DeviceType;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

// 생성 요청
interface CreateBLEDeviceInput {
  deviceName: string;        // 예: "KOABP-KB1-5302"
  deviceId: string;
  deviceType: DeviceType;
}

// 수정 요청
interface UpdateBLEDeviceInput {
  deviceName?: string;
  deviceId?: string;
  deviceType?: DeviceType;
}

// 조회 필터
interface BLEDeviceFilter {
  author?: string;
  deviceType?: DeviceType;
}
```

## 🔗 Users & Products API

기존 Users, Products API도 동일한 패턴으로 사용 가능합니다:

```tsx
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useProducts,
  useProduct,
  useHealth
} from '@/lib/queries';
```

## ⚙️ 직접 API Client 사용 (Hook 없이)

`queries.ts` 참조. 이 패턴을 사용하기로 한다!!!!

## 🎨 DeviceImprint 컴포넌트 업데이트 예시

기존 코드를 queries.ts를 사용하도록 변경:

```tsx
// Before
import { useApi } from '../hooks/useApi';
const api = useApi();

export const checkDeviceNumberExists = (deviceNumber: string) => {
  return false; // TODO: implement API
}

// After
import { checkDeviceNumberExists, getNextDeviceNumber } from '../lib/queries';

// 직접 사용
const exists = await checkDeviceNumberExists('KOABP-KB1-5302');
const nextNumber = await getNextDeviceNumber('KB-1');
```

## 🌐 백엔드 엔드포인트 매핑

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `useDevices(filter)` | GET | `/api/devices` | 디바이스 목록 (필터) |
| `useDeviceByName(name)` | GET | `/api/devices/:name` | 이름으로 조회 |
| `useDeviceById(id)` | GET | `/api/devices/:id` | ID로 조회 |
| `useCreateDevice()` | POST | `/api/devices` | 디바이스 등록 |
| `useUpdateDevice()` | PUT | `/api/devices/:name` | 디바이스 수정 |
| `useDeleteDevice()` | DELETE | `/api/devices/:name` | 디바이스 삭제 |

## 💡 Best Practices

1. **컴포넌트에서는 queries.ts만 import**
   ```tsx
   // ✅ Good
   import { useDevices, useCreateDevice } from '@/lib/queries';

   // ❌ Avoid
   import { useApi } from '@/hooks/useApi';
   ```

2. **에러 처리는 항상 추가**
   ```tsx
   const { data, error } = useDevices();
   if (error) {
     // 사용자에게 알림
   }
   ```

3. **성공/실패 콜백 활용**
   ```tsx
   const { mutate } = useCreateDevice({
     onSuccess: (device) => {
       // refetch, 상태 업데이트 등
     },
     onError: (error) => {
       // 에러 처리
     }
   });
   ```

4. **타입 안정성 활용**
   ```tsx
   // TypeScript가 자동으로 타입 체크
   const { data } = useDevices(); // data: BLEDeviceData[] | null
   ```