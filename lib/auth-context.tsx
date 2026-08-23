"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { MOCK_USERS, roleAtLeast, type Role, type SessionUser } from "./mock-data"

interface LoginResult {
  success: boolean
  error?: string
  role?: Role
}

interface AuthContextType {
  user: SessionUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  startDemoSession: (name: string, email: string) => SessionUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "omnistack_user"

function toSessionUser(user: (typeof MOCK_USERS)[number]): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate sesi dari localStorage saat mount (client-side only).
  // Dilakukan lewat microtask agar tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      await Promise.resolve()
      if (cancelled) return

      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as SessionUser
          const valid = MOCK_USERS.find((u) => u.id === parsed.id && u.isActive)
          if (valid) {
            setUser(toSessionUser(valid))
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }

      setIsLoading(false)
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    // Simulasi delay network request
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (!mockUser) {
      return { success: false, error: "Email atau password salah." }
    }

    if (!mockUser.isActive) {
      return { success: false, error: "Akun tidak aktif. Hubungi admin." }
    }

    const session = toSessionUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)

    return { success: true, role: mockUser.role }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  /**
   * Buat sesi demo langsung tanpa login (dipakai alur registrasi).
   * User baru selalu mendapat role USER (default, sesuai README Role System).
   */
  const startDemoSession = (name: string, email: string): SessionUser => {
    const session: SessionUser = {
      id: `user-local-${Date.now()}`,
      email,
      name,
      role: "USER",
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, startDemoSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider")
  }
  return context
}

/** Cek apakah user login punya level >= required (ADMIN > USER > VIEWER) */
export function useHasRole(required: Role): boolean {
  const { user } = useAuth()
  if (!user) return false
  return roleAtLeast(user.role, required)
}

export function useIsAdmin(): boolean {
  return useHasRole("ADMIN")
}
