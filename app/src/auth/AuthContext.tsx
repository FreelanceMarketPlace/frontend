import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/user'
import * as userApi from '../api/userApi'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore'

type AuthState = {
  isBootstrapping: boolean
  accessToken: string | null
  user: UserResponse | null
}

type AuthActions = {
  register: (req: RegisterRequest) => Promise<void>
  login: (req: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | null>(null)

function applyAuthResponse(res: AuthResponse, setUser: (u: UserResponse) => void, setTokenState: (t: string) => void) {
  setAccessToken(res.accessToken)
  setTokenState(res.accessToken)
  setUser(res.user)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken())
  const [user, setUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        // Prefer refresh cookie if present
        const res = await userApi.refresh()
        if (cancelled) return
        applyAuthResponse(res, setUser, (t) => setAccessTokenState(t))
      } catch {
        // Fall back to /me if token exists
        const token = getAccessToken()
        if (!token) {
          if (!cancelled) setUser(null)
          return
        }
        try {
          const me = await userApi.me()
          if (!cancelled) setUser(me)
        } catch {
          clearAccessToken()
          if (!cancelled) {
            setAccessTokenState(null)
            setUser(null)
          }
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const actions: AuthActions = useMemo(
    () => ({
      async register(req) {
        await userApi.register(req)
      },
      async login(req) {
        const res = await userApi.login(req)
        applyAuthResponse(res, setUser, (t) => setAccessTokenState(t))
      },
      async logout() {
        try {
          await userApi.logout()
        } finally {
          clearAccessToken()
          setAccessTokenState(null)
          setUser(null)
        }
      },
      async refresh() {
        const res = await userApi.refresh()
        applyAuthResponse(res, setUser, (t) => setAccessTokenState(t))
      },
    }),
    [],
  )

  const value: AuthContextValue = {
    isBootstrapping,
    accessToken,
    user,
    ...actions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
