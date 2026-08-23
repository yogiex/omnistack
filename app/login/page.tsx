// app/login/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Boxes,
  Shield,
  Eye,
  EyeOff,
  Code2,
  Loader2,
  CheckCircle2,
  FlaskConical,
} from "lucide-react"
import { SiGithub } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  MOCK_USERS,
  ROLE_REDIRECTS,
  type Role,
} from "@/lib/mock-data"

// ==================== KONFIGURASI VISUAL PER ROLE ====================
// Warna dual-mode: -600 untuk light mode (kontras >= 4.5:1 di atas putih),
// -400 untuk dark mode.
const ROLE_CONFIG: Record<Role, {
  icon: typeof Shield
  label: string
  description: string
  color: string
  badgeColor: string
}> = {
  ADMIN: {
    icon: Shield,
    label: "Admin",
    description: "Full system access",
    color: "text-amber-600 dark:text-amber-400",
    badgeColor:
      "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
  },
  USER: {
    icon: Code2,
    label: "Developer",
    description: "Manage your own projects",
    color: "text-blue-600 dark:text-blue-400",
    badgeColor:
      "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
  },
  VIEWER: {
    icon: Eye,
    label: "Viewer",
    description: "Read-only access",
    color: "text-emerald-600 dark:text-emerald-400",
    badgeColor:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  },
}

// ==================== COMPONENT ====================
export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading: authIsLoading, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successRole, setSuccessRole] = useState<Role | null>(null)

  // Supaya auto-redirect tidak berjalan tepat setelah login manual
  // (biarkan animasi sukses tampil dulu sebelum push)
  const justLoggedInRef = useRef(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sudah login? Redirect otomatis sesuai role
  useEffect(() => {
    if (justLoggedInRef.current) return
    if (!authIsLoading && user) {
      router.replace(ROLE_REDIRECTS[user.role])
    }
  }, [user, authIsLoading, router])

  // Cleanup timer redirect saat unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  const finishLogin = async (candidateEmail: string, candidatePassword: string) => {
    setError(null)
    setSuccessRole(null)

    const result = await login(candidateEmail, candidatePassword)

    if (!result.success || !result.role) {
      setError(result.error ?? "Login gagal. Coba lagi.")
      setIsLoading(false)
      return
    }

    justLoggedInRef.current = true
    setSuccessRole(result.role)

    // Delay singkat agar user sempat melihat feedback sukses
    redirectTimerRef.current = setTimeout(() => {
      router.push(ROLE_REDIRECTS[result.role!])
    }, 1200)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await finishLogin(email, password)
  }

  const handleQuickLogin = async (candidateEmail: string, candidatePassword: string) => {
    setEmail(candidateEmail)
    setPassword(candidatePassword)
    setIsLoading(true)
    await finishLogin(candidateEmail, candidatePassword)
  }

  // Hindari flash form login untuk user yang sudah punya sesi
  if (authIsLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ================= SISI KIRI: BRANDING ================= */}
      <div className="relative hidden bg-slate-950 lg:flex flex-col justify-between p-12 text-slate-50 overflow-hidden">
        {/* Efek Gradient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/noise.svg')]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="OmniStack — kembali ke halaman utama"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">OmniStack</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              Developer Operating System.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Rangkai bahasa pemrograman dan library apa pun yang Anda inginkan.
            Biarkan AI kami yang menyatukannya menjadi infrastruktur produksi
            dalam hitungan detik.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4 pt-4">
            <FeatureItem
              color="cyan"
              text="Zero-Config CI/CD Pipeline"
            />
            <FeatureItem
              color="violet"
              text="AI Prompt Engineer Terintegrasi"
            />
            <FeatureItem
              color="emerald"
              text="Multi-Node Auto-Scaling Cluster"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-500">
          © 2026 OmniStack Inc. All rights reserved.
        </div>
      </div>

      {/* ================= SISI KANAN: FORM LOGIN ================= */}
      <div className="flex flex-col gap-4 p-6 md:p-10 lg:p-12 bg-background">
        {/* Logo Mobile */}
        <div className="flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="OmniStack — kembali ke halaman utama"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">OmniStack</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight">
                Selamat Datang Kembali
              </h2>
              <p className="text-sm text-muted-foreground">
                Masuk ke workspace Anda untuk melanjutkan deployment.
              </p>
            </div>

            {/* GitHub OAuth (placeholder) */}
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              disabled={isLoading}
              onClick={() =>
                setError("Login via GitHub belum tersedia. Gunakan email untuk saat ini.")
              }
            >
              <SiGithub className="mr-2 h-4 w-4" />
              Lanjutkan dengan GitHub
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Atau lanjut dengan email
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive"
              >
                {error}
              </div>
            )}

            {/* Success Message dengan Role */}
            {successRole && (
              <div
                role="status"
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-4",
                  ROLE_CONFIG[successRole].badgeColor
                )}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Login berhasil sebagai {ROLE_CONFIG[successRole].label}
                  </p>
                  <p className="text-xs opacity-80">
                    Mengalihkan ke dashboard...
                  </p>
                </div>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              </div>
            )}

            {/* Form Login */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  autoComplete="email"
                  aria-describedby={error ? "login-error" : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-describedby={error ? "login-error" : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                    className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Ingat saya selama 30 hari
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-base cursor-pointer"
                size="lg"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                )}
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Daftar Workspace Baru
              </Link>
            </div>

            {/* ==================== QUICK LOGIN (TEST ACCOUNTS) ==================== */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FlaskConical className="h-3.5 w-3.5" aria-hidden />
                Login Cepat — Akun Pengujian
              </p>

              <div className="space-y-2">
                {MOCK_USERS.filter((mockUser) => mockUser.isActive).map((mockUser) => {
                  const config = ROLE_CONFIG[mockUser.role]
                  const Icon = config.icon

                  return (
                    <button
                      key={mockUser.email}
                      type="button"
                      onClick={() =>
                        handleQuickLogin(mockUser.email, mockUser.password)
                      }
                      disabled={isLoading}
                      aria-label={`Login otomatis sebagai ${config.label} (${mockUser.email})`}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        "hover:bg-muted/60 hover:shadow-sm active:scale-[0.98]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:opacity-50 disabled:pointer-events-none",
                        config.badgeColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", config.color)} aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/90">
                          {config.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {mockUser.email}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Klik salah satu untuk masuk otomatis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================
function FeatureItem({
  color,
  text,
}: {
  color: "cyan" | "violet" | "emerald"
  text: string
}) {
  const colorMap = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      dot: "bg-cyan-400",
      glow: "shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      dot: "bg-violet-400",
      glow: "shadow-[0_0_8px_rgba(167,139,250,0.6)]",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
      glow: "shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    },
  }

  const c = colorMap[color]

  return (
    <div className="flex items-center gap-3 text-slate-300">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border",
          c.bg,
          c.border
        )}
        aria-hidden
      >
        <div className={cn("h-2 w-2 rounded-full", c.dot, c.glow)} />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
