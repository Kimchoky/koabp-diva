import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react'

export interface SessionInfo {
  name: string;
  loginTime: Date;
  workCount: number;
}

interface SessionContextType {
  user: SessionInfo | null;
  login: (user: SessionInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
  increaseWorkCount: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null)

  const login = useCallback((_session: SessionInfo) => {
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
    user: session,
    login,
    logout,
    isAuthenticated,
    increaseWorkCount,
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