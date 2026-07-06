import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  api,
  clearStoredUser,
  getStoredUser,
  setStoredUser,
  type StoredUser,
} from '@/lib/api'

export interface LoginResponse {
  userId: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  token: string
  role?: string
  message?: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

interface AuthContextValue {
  user: StoredUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<StoredUser>
  register: (input: RegisterInput) => Promise<StoredUser>
  logout: () => void
  updateUser: (patch: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'avatarUrl'>>) => void
  displayName: string
  role: 'patient' | 'doctor' | 'admin'
}

const AuthContext = createContext<AuthContextValue | null>(null)

function normalize(res: LoginResponse): StoredUser {
  return {
    userId: res.userId,
    username: res.username,
    email: res.email,
    firstName: res.firstName,
    lastName: res.lastName,
    token: res.token,
    role: (res.role || 'patient').toLowerCase(),
    message: res.message,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser())

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { username, password })
    const stored = normalize(res)
    setStoredUser(stored)
    setUser(stored)
    return stored
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    // Backend forces role = PATIENT for public registration and returns a token,
    // so we can log the new user straight in.
    const res = await api.post<LoginResponse>('/auth/register', { ...input, role: 'patient' })
    const stored = normalize(res)
    setStoredUser(stored)
    setUser(stored)
    return stored
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    setUser(null)
  }, [])

  const updateUser = useCallback(
    (patch: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'avatarUrl'>>) => {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...patch }
        setStoredUser(next)
        return next
      })
    },
    [],
  )

  const value = useMemo<AuthContextValue>(() => {
    const displayName =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
      user?.username ||
      'Guest'
    const role = (user?.role as AuthContextValue['role']) || 'patient'
    return {
      user,
      isAuthenticated: !!user?.token,
      login,
      register,
      logout,
      updateUser,
      displayName,
      role,
    }
  }, [user, login, register, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
