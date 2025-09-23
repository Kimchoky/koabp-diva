import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface UserInfo {
  name: string
  loginTime: Date
}

interface AuthContextType {
  user: UserInfo | null
  login: (name: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)

  const login = useCallback((name: string) => {
    setUser({
      name,
      loginTime: new Date()
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const isAuthenticated = user !== null

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}