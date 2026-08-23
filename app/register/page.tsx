"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Boxes, ArrowRight, ArrowLeft, Check, X, Shield, Mail, Lock, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react"
import { SiGithub } from "react-icons/si"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import zxcvbn from "zxcvbn"

// ==================== STEP TYPES ====================
type RegisterStep = "info" | "otp" | "password" | "success"

// ==================== PASSWORD GENERATOR ====================
const generatePassword = (length = 16) => {
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
  const all = lower + upper + numbers + symbols

  let password = ""
  // Pastikan minimal 1 dari setiap kategori
  password += lower[Math.floor(Math.random() * lower.length)]
  password += upper[Math.floor(Math.random() * upper.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Isi sisa karakter secara acak
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Acak urutan karakter
  return password.split("").sort(() => Math.random() - 0.5).join("")
}

// ==================== PASSWORD STRENGTH CONFIG ====================
const strengthConfig = {
  0: { label: "Sangat Lemah", color: "bg-red-500", textColor: "text-red-500", width: "w-1/5" },
  1: { label: "Lemah", color: "bg-orange-500", textColor: "text-orange-500", width: "w-2/5" },
  2: { label: "Cukup", color: "bg-yellow-500", textColor: "text-yellow-500", width: "w-3/5" },
  3: { label: "Kuat", color: "bg-lime-500", textColor: "text-lime-500", width: "w-4/5" },
  4: { label: "Sangat Kuat", color: "bg-green-500", textColor: "text-green-500", width: "w-full" },
} as const

// ==================== OTP INPUT COMPONENT ====================
function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (val: string) => void }) {
  const inputs = Array.from({ length }, (_, i) => value[i] || "")

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const newValue = inputs.map((v, i) => (i === index ? char : v)).join("")
    onChange(newValue)
    if (char && index < length - 1) {
      const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
      next?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !inputs[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      prev?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").slice(0, length).replace(/\D/g, "")
    onChange(pasted.padEnd(length, ""))
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {inputs.map((char, i) => (
        <Input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "h-14 w-12 text-center text-2xl font-mono font-bold",
            char && "border-primary"
          )}
        />
      ))}
    </div>
  )
}

// ==================== PASSWORD STRENGTH METER ====================
function PasswordStrengthMeter({ password }: { password: string }) {
  const result = useMemo(() => (password ? zxcvbn(password) : null), [password])

  if (!password) return null

  const config = strengthConfig[result?.score ?? 0]
  const feedback = result?.feedback?.warning || result?.feedback?.suggestions[0]

  return (
    <div className="space-y-2 pt-2">
      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-medium">Kekuatan Password</span>
          <span className={cn("font-semibold", config.textColor)}>{config.label}</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 rounded-full", config.color, config.width)}
          />
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <span className="text-amber-500">💡</span>
          {feedback}
        </p>
      )}

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {[
          { label: "Minimal 8 karakter", met: password.length >= 8 },
          { label: "Huruf besar (A-Z)", met: /[A-Z]/.test(password) },
          { label: "Huruf kecil (a-z)", met: /[a-z]/.test(password) },
          { label: "Angka (0-9)", met: /[0-9]/.test(password) },
          { label: "Simbol (!@#$)", met: /[^A-Za-z0-9]/.test(password) },
        ].map((req) => (
          <div key={req.label} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== MAIN PAGE ====================
export default function RegisterPage() {
  const { startDemoSession } = useAuth()
  const [step, setStep] = useState<RegisterStep>("info")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // OTP Countdown Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setInterval(() => setOtpTimer((t) => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [otpTimer])

  // Password match validation
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  // Simulasi kirim OTP
  const handleSendOtp = async () => {
    if (!email.includes("@")) return
    setIsLoading(true)
    // Simulasi API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    setOtpTimer(60)
    setStep("otp")
  }

  // Simulasi verifikasi OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setStep("password")
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setOtpTimer(60)
    setOtp("")
  }

  // Submit final
  const handleFinalSubmit = async () => {
    if (!passwordsMatch || !agreedToTerms) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    setStep("success")
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ================= SISI KIRI: BRANDING & VISUAL ================= */}
      <div className="relative hidden bg-slate-950 lg:flex flex-col justify-between p-12 text-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">OmniStack</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Mulai Bangun <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              Masa Depan Aplikasi Anda.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Bergabunglah dengan ribuan developer yang telah beralih dari konfigurasi manual. Dapatkan akses ke AI Architect dan deployment otomatis hari ini.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
              <span className="text-sm font-medium">Gratis selamanya untuk 3 proyek pertama</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20">
                <div className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
              </div>
              <span className="text-sm font-medium">Verifikasi email untuk keamanan akun</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
              <span className="text-sm font-medium">Password strength meter real-time</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2026 OmniStack Inc. All rights reserved.
        </div>
      </div>

      {/* ================= SISI KANAN: FORM REGISTER ================= */}
      <div className="flex flex-col gap-4 p-6 md:p-10 lg:p-12 bg-background">
        {/* Logo Mobile */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">OmniStack</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            {/* Progress Steps Indicator */}
            <div className="flex items-center justify-center gap-2">
              {(["info", "otp", "password", "success"] as RegisterStep[]).map((s, i) => {
                const stepIndex = ["info", "otp", "password", "success"].indexOf(step)
                const isActive = i === stepIndex
                const isCompleted = i < stepIndex
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                        isActive && "bg-primary text-primary-foreground scale-110",
                        isCompleted && "bg-green-500 text-white",
                        !isActive && !isCompleted && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < 3 && (
                      <div
                        className={cn(
                          "h-0.5 w-8 md:w-12 transition-all",
                          isCompleted ? "bg-green-500" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* ================= STEP 1: INFO & EMAIL ================= */}
            {step === "info" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold tracking-tight">Buat Akun Baru</h2>
                  <p className="text-sm text-muted-foreground">
                    Mulai dengan email Anda. Kami akan mengirim kode verifikasi.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full" size="lg">
                    <SiGithub className="mr-2 h-4 w-4" />
                    Daftar dengan GitHub
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Atau dengan email</span>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSendOtp() }}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="nama@perusahaan.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                        required
                      />
                      <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground cursor-pointer leading-snug">
                        Saya setuju dengan{" "}
                        <Link href="/terms" className="text-primary underline-offset-4 hover:underline font-medium">
                          Persyaratan Layanan
                        </Link>{" "}
                        dan{" "}
                        <Link href="/privacy" className="text-primary underline-offset-4 hover:underline font-medium">
                          Kebijakan Privasi
                        </Link>{" "}
                        OmniStack.
                      </Label>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" size="lg" disabled={isLoading || !agreedToTerms}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim Kode...
                        </>
                      ) : (
                        <>
                          Kirim Kode Verifikasi
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Masuk ke Workspace
                  </Link>
                </div>
              </div>
            )}

            {/* ================= STEP 2: OTP VERIFICATION ================= */}
            {step === "otp" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      <Shield className="h-7 w-7 text-cyan-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Verifikasi Email</h2>
                  <p className="text-sm text-muted-foreground">
                    Kami telah mengirim kode 6 digit ke{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OtpInput length={6} value={otp} onChange={setOtp} />

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Kirim ulang kode dalam{" "}
                        <span className="font-mono font-bold text-foreground">{otpTimer}s</span>
                      </p>
                    ) : (
                      <Button
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm"
                      >
                        {isLoading ? "Mengirim..." : "Kirim ulang kode"}
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep("info")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>
                    <Button
                      className="flex-[2] h-11 text-base"
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          Verifikasi
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: PASSWORD ================= */}
            {step === "password" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20">
                      <Lock className="h-7 w-7 text-violet-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Buat Password</h2>
                  <p className="text-sm text-muted-foreground">
                    Email terverifikasi. Sekarang buat password yang kuat.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleFinalSubmit() }}>
                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => {
                          const newPassword = generatePassword(16)
                          setPassword(newPassword)
                          setConfirmPassword(newPassword)
                        }}
                      >
                        <RefreshCw className="mr-1.5 h-3 w-3" />
                        Generate
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={password} />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password Anda"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={cn(
                          "h-11 pr-10",
                          confirmPassword && (passwordsMatch ? "border-green-500" : "border-red-500")
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className={cn(
                        "text-xs flex items-center gap-1.5",
                        passwordsMatch ? "text-green-500" : "text-red-500"
                      )}>
                        {passwordsMatch ? (
                          <>
                            <Check className="h-3 w-3" />
                            Password cocok
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            Password tidak cocok
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      type="button"
                      onClick={() => setStep("otp")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="flex-[2] h-11 text-base"
                      disabled={!passwordsMatch || !agreedToTerms || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat Akun...
                        </>
                      ) : (
                        <>
                          Buat Workspace
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 4: SUCCESS ================= */}
            {step === "success" && (
              <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                    <Check className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Akun Berhasil Dibuat! 🎉</h2>
                  <p className="text-sm text-muted-foreground">
                    Selamat datang di OmniStack, <span className="font-medium text-foreground">{name}</span>.
                    Workspace Anda sedang disiapkan.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Terverifikasi</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Workspace Default</p>
                      <p className="text-xs text-muted-foreground">{name.toLowerCase().replace(/\s/g, "-")}-workspace</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() =>
                    startDemoSession(
                      name || "Pengguna Baru",
                      email || "user@omnistack.dev"
                    )
                  }
                  className={cn(buttonVariants({ size: "lg" }), "w-full h-11 text-base")}
                >
                  Masuk ke Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}