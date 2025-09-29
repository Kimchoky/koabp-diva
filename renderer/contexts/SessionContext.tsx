import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react'
import {getMe, postLogin} from "../lib/queries";
import {UserInfo} from "../types/api";

type WorkType = 'imprint' | 'verify'

export interface SessionType {
  user: UserInfo;
  loginTime: Date;
  works: Record<WorkType, Record<DeviceType, number>>
}

export interface ImprintDeviceType {
  type: DeviceType;
  id: string;
  name: string;
  timestamp: number;
}

export interface UiStateType {
  factoryMode: 'on' | 'off' | 'unknown'
  imprintDevice: ImprintDeviceType | null
}

interface SessionContextType {
  session: SessionType | null;
  login: (id: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  increaseWorkCount: (workType: WorkType, deviceType: DeviceType) => void;
  uiState: UiStateType;
  setUiState: React.Dispatch<React.SetStateAction<UiStateType>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionType | null>(null)
  const [uiState, setUiState] = useState<UiStateType>({
    factoryMode: 'unknown',
    imprintDevice: null
  })

  const login = useCallback(async (id: string, password: string) => {
    const user = await postLogin(id, password)
    const keepLoggedIn = localStorage.getItem('keepLoggedIn')
    if (keepLoggedIn) {
      localStorage.setItem('token', user?.token)
    }
    setSession({
      user,
      loginTime: new Date(),
      works: {
        imprint: {'KB-1': 0, 'CA-100': 0, 'TP-1': 0, 'CP-1': 0,},
        verify: {'KB-1': 0, 'CA-100': 0, 'TP-1': 0, 'CP-1': 0,},
      },
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setSession(null);
  }, [])

  const isAuthenticated = session !== null

  const increaseWorkCount = (workType: WorkType, deviceType: DeviceType) => {
    setSession(prev => ({
      ...prev,
      works: {
        imprint: {
          ...prev.works.imprint,
          [deviceType]: prev.works.imprint[deviceType] + (workType === 'imprint' ? 1 : 0),
        },
        verify: {
          ...prev.works.verify,
          [deviceType]: prev.works.verify[deviceType] + (workType === 'verify' ? 1 : 0),
        }
      }
    }))
  }

  useEffect(() => {
    const tryLoginWithToken = async () => {
      const keepLoggedIn = localStorage.getItem('keepLoggedIn')
      const token = localStorage.getItem('token')
      if (keepLoggedIn && token) {
        console.log('trying auto log in')
        const user = await getMe()
        if (user) {
          setSession({
            user,
            loginTime: new Date(),
            works: {
              imprint: {'KB-1': 0, 'CA-100': 0, 'TP-1': 0, 'CP-1': 0,},
              verify: {'KB-1': 0, 'CA-100': 0, 'TP-1': 0, 'CP-1': 0,},
            }
          })
        }
      }
    }

    tryLoginWithToken();
  }, []);

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