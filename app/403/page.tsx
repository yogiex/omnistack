"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, Home, ShieldX } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const REQUEST_EMAIL = "access@omnistack.dev"

/**
 * 403 — role tidak cukup.
 *
 * Catatan: `RouteGuard` saat ini mengarahkan role kurang ke `/dashboard`,
 * bukan ke halaman ini. Routing ke `/403` belum diaktifkan.
 */
export default function ForbiddenPage() {
  const { user } = useAuth()
  const [showRequest, setShowRequest] = useState(false)
  const [copied, setCopied] = useState(false)

  const mailtoHref = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(
    "Access Request — OmniStack"
  )}&body=${encodeURIComponent(
    `Halo tim OmniStack,\n\nSaya (${
      user?.email ?? "guest"
    }) ingin meminta akses ke halaman ini.\n\nTerima kasih.`
  )}`

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(REQUEST_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard ditolak browser (tanpa HTTPS / tanpa izin) — user
      // masih bisa menyalin manual dari teks yang sama.
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center">
        <p className="font-mono text-7xl font-bold tracking-tighter text-rose-500/90 sm:text-9xl">
          403
        </p>

        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
          <ShieldX
            className="size-6 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Akses ditolak
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? `Role ${user.role} tidak memiliki izin untuk membuka halaman ini.`
            : "Anda tidak memiliki izin untuk membuka halaman ini."}
        </p>

        {showRequest && (
          <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Kirim permintaan akses
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs">
                {REQUEST_EMAIL}
              </code>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copy email"
                onClick={copyEmail}
                className="size-7 shrink-0"
              >
                {copied ? (
                  <Check
                    className="size-3.5 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <a
                href={mailtoHref}
                className={cn(buttonVariants({ size: "sm" }), "flex-1")}
              >
                Kirim Email
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRequest(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {!showRequest && (
            <Button onClick={() => setShowRequest(true)}>
              Request Access
            </Button>
          )}
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            <Home className="size-4" aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Beranda
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Butuh akses lebih tinggi? Hubungi administrator sistem Anda.
        </p>
      </div>
    </main>
  )
}
