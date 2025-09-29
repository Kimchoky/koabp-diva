# API Hooks 사용 가이드

통합된 API Hook 시스템입니다. IPC를 통해 Main 프로세스에서 외부 API 서버와 통신합니다.

## 📦 제공되는 Hooks

### 1. `useApi` - 범용 API 호출
수동으로 API를 호출할 때 사용합니다. GET, POST, PUT, DELETE, PATCH 모두 지원합니다.

```tsx
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const api = useApi<User>();

  const handleFetchUser = async () => {
    await api.execute('users/123', { method: 'GET' });
  };

  const handleCreateUser = async () => {
    await api.execute('users', {
      method: 'POST',
      data: { name: 'John', email: 'john@example.com' }
    });
  };

  return (
    <div>
      {api.loading && <p>Loading...</p>}
      {api.error && <p>Error: {api.error.message}</p>}
      {api.data && <pre>{JSON.stringify(api.data, null, 2)}</pre>}

      <button onClick={handleFetchUser}>Fetch User</button>
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
}
```

### 2. `useQuery` - GET 요청 (자동 실행)
컴포넌트가 마운트될 때 자동으로 데이터를 가져옵니다.

```tsx
import { useQuery } from '@/hooks/useApi';

function UserList() {
  const { data, loading, error, refetch } = useQuery<User[]>('users', {
    enabled: true,  // false면 자동 실행 안 함
    refetchOnWindowFocus: true,  // 창 포커스 시 자동 refetch
    params: { limit: 10 },  // 쿼리 파라미터
    onSuccess: (data) => {
      console.log('Users loaded:', data);
    },
    onError: (error) => {
      console.error('Failed to load users:', error);
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. `useMutation` - POST/PUT/DELETE 요청 (수동 실행)
데이터를 변경할 때 사용합니다.

```tsx
import { useMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api-client';

interface CreateUserInput {
  name: string;
  email: string;
}

function CreateUserForm() {
  const { mutate, loading, error } = useMutation<User, CreateUserInput>(
    async (variables) => {
      return await apiClient.post('users', variables);
    },
    {
      onSuccess: (data) => {
        console.log('User created:', data);
        alert('User created successfully!');
      },
      onError: (error) => {
        console.error('Error:', error);
        alert(`Failed: ${error.message}`);
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

## 🔧 API 설정

### 서버 주소 및 공통 헤더 설정

`renderer/lib/api-config.ts` 파일에서 설정:

```ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // 필요한 공통 헤더 추가
    'Authorization': 'Bearer token',
    'X-API-Key': 'your-api-key',
  },
};
```

### 런타임에 설정 업데이트

```tsx
import { updateApiConfig } from '@/lib/api-config';

// 예: 로그인 후 토큰 설정
updateApiConfig({
  headers: {
    ...API_CONFIG.headers,
    'Authorization': `Bearer ${token}`
  }
});
```

## 🌐 직접 API Client 사용

Hook 없이 직접 호출하고 싶을 때:

```tsx
import { apiClient } from '@/lib/api-client';

// GET
const users = await apiClient.get<User[]>('users');
const user = await apiClient.get<User>('users/123', { includeDeleted: true });

// POST
const newUser = await apiClient.post<User>('users', {
  name: 'John',
  email: 'john@example.com'
});

// PUT
const updatedUser = await apiClient.put<User>('users/123', {
  name: 'John Doe'
});

// DELETE
await apiClient.delete('users/123');

// PATCH
const patchedUser = await apiClient.patch<User>('users/123', {
  email: 'newemail@example.com'
});
```

## 📝 타입 정의

```tsx
// 응답 타입
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// 에러 타입
interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}
```

## 🎯 실전 예제

### 전체 CRUD 예제

```tsx
import { useQuery, useMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api-client';

function UserManagement() {
  // 사용자 목록 조회 (자동 실행)
  const { data: users, loading, refetch } = useQuery<User[]>('users');

  // 사용자 생성
  const createUser = useMutation<User, CreateUserInput>(
    (data) => apiClient.post('users', data),
    { onSuccess: () => refetch() }
  );

  // 사용자 수정
  const updateUser = useMutation<User, { id: string; data: Partial<User> }>(
    ({ id, data }) => apiClient.put(`users/${id}`, data),
    { onSuccess: () => refetch() }
  );

  // 사용자 삭제
  const deleteUser = useMutation<void, string>(
    (id) => apiClient.delete(`users/${id}`),
    { onSuccess: () => refetch() }
  );

  return (
    <div>
      {loading && <p>Loading...</p>}

      <button onClick={() => createUser.mutate({ name: 'New', email: 'new@test.com' })}>
        Add User
      </button>

      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => updateUser.mutate({
              id: user.id,
              data: { name: 'Updated' }
            })}>
              Edit
            </button>
            <button onClick={() => deleteUser.mutate(user.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## ⚠️ 중요 사항

1. **IPC 통신**: 모든 API 요청은 Main 프로세스를 통해 처리됩니다
2. **환경 변수**: `NEXT_PUBLIC_API_URL`로 서버 주소 설정
3. **에러 처리**: 항상 `error` 상태를 확인하고 사용자에게 피드백 제공
4. **타입 안정성**: 제네릭을 사용하여 타입 안정성 확보

## 🗑️ 제거된 파일

- `useQuery.ts` (삭제됨 - `useApi.ts`로 통합)
- 기존 `useApi.ts` (백업: `useApi.ts.backup`)