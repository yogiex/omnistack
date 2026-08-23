"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { roleAtLeast, type Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface RouteGuardProps {
  children: React.ReactNode
  /** Role minimal yang dibutuhkan (ADMIN > USER > VIEWER). Kosong = cukup login. */
  requiredRole?: Role
  /** Tujuan redirect jika belum login */
  redirectTo?: string
}

/**
 * Guard client-side untuk static export.
 * - Belum login   → redirect ke `redirectTo`
 * - Role kurang   → redirect ke /dashboard
 * Catatan: ini proteksi UI (gimmick MVP), bukan keamanan sungguhan.
 */
export function RouteGuard({
  children,
  requiredRole,
  redirectTo = "/login",
}: RouteGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const roleDenied =
    !!user && !!requiredRole && !roleAtLeast(user.role, requiredRole)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace(redirectTo)
      return
    }
    if (requiredRole && !roleAtLeast(user.role, requiredRole)) {
      router.replace("/dashboard")
    }
  }, [user, isLoading, requiredRole, router, redirectTo])

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-svh items-center justify-center bg-background"
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || roleDenied) return null

  return <>{children}</>
}
