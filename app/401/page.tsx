"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, ShieldCheck, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const REDIRECT_SECONDS = 8

/**
 * 401 — sesi tidak ditemukan.
 *
 * Catatan: folder `401/` hanya.route biasa (`/401`), bukan file konvensi
 * Next.js. Di static export tidak ada server yang mengembalikan status 401,
 * jadi halaman ini dipakai lewat redirect eksplisit, bukan oleh nginx.
 *
 * `default export` wajib untuk `page.tsx` — pengecualian dari aturan
 * "named exports" di AGENTS.md.
 */
export default function UnauthorizedPage() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (cancelled) return
    if (secondsLeft <= 0) {
      router.push("/login")
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, cancelled, router])

  const progress =
    ((REDIRECT_SECONDS - secondsLeft) / REDIRECT_SECONDS) * 100

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center">
        <p className="font-mono text-7xl font-bold tracking-tighter text-amber-500/90 sm:text-9xl">
          401
        </p>

        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
          <Lock
            className="size-6 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Sesi tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anda perlu login dulu untuk mengakses halaman ini.
        </p>

        {cancelled ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Auto-redirect dibatalkan.
          </p>
        ) : (
          <div className="mt-6 space-y-2">
            <div
              role="progressbar"
              aria-label="Hitung mundur redirect"
              aria-valuemin={0}
              aria-valuemax={REDIRECT_SECONDS}
              aria-valuenow={REDIRECT_SECONDS - secondsLeft}
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-amber-500 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs tabular-nums text-muted-foreground">
              Mengarahkan ke halaman login dalam {secondsLeft}s
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/login" className={cn(buttonVariants(), "gap-1.5")}>
            <ShieldCheck className="size-4" aria-hidden="true" />
            Login Sekarang
          </Link>
          {!cancelled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelled(true)}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
              Batalkan
            </Button>
          )}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </main>
  )
}
