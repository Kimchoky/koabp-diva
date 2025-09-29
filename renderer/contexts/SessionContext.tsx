import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react'

export interface SessionInfoType {
  name: string;
  loginTime: Date;
  workCount: number;
}

export interface ImprintDeviceType {
  type: DeviceType;
  id: string;
  name: string;
  timestamp: Date;
}

export interface UiStateType {
  factoryMode: 'on' | 'off' | 'unknown'
  imprintDevice: ImprintDeviceType | null
}

interface SessionContextType {
  session: SessionInfoType | null;
  login: (user: SessionInfoType) => void;
  logout: () => void;
  isAuthenticated: boolean;
  increaseWorkCount: () => void;
  uiState: UiStateType;
  setUiState: React.Dispatch<React.SetStateAction<UiStateType>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfoType | null>(null)
  const [uiState, setUiState] = useState<UiStateType>({
    factoryMode: 'unknown',
    imprintDevice: null
  })

  const login = useCallback((_session: SessionInfoType) => {
    setSession({
      ..._session,
      loginTime: new Date(),
      workCount: 0,
    })
  }, [])

  const logout = useCallback(() => {
    setSession(null);
  }, [])

  const isAuthenticated = session !== null

  const increaseWorkCount = () => {
    setSession(prev => ({
      ...prev,
      workCount: prev.workCount + 1,
    }))
  }

  const value: SessionContextType = {
    session,
    login,
    logout,
    isAuthenticated,
    increaseWorkCount,
    uiState, setUiState,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within an SessionProvider')
  }
  return context
}