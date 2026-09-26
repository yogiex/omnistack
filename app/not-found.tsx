"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Compass, Home, Search, Sparkle } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Hanya rute yang benar-benar ada. `not-found.tsx` yang menautkan ke
 * `/docs` (mis.) akan menghasilkan 404 kedua di halaman 404.
 */
const SUGGESTIONS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/deployments", label: "Deployments" },
  { href: "/finops", label: "FinOps" },
  { href: "/ai-architect", label: "AI Architect" },
  { href: "/settings", label: "Settings" },
]

const EGG = "omni"
const EGG_MS = 2400

/**
 * 404 — file konvensi Next.js, diprerender jadi `out/404.html` dan
 * dipakai nginx lewat `error_page 404 /404.html`.
 *
 * `default export` wajib di sini — pengecualian dari aturan "named
 * exports" di AGENTS.md.
 */
export default function NotFound() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [easterEgg, setEasterEgg] = useState(false)

  // Easter egg mengetik "omni" di keyboard. Buffer terpisah dari `query`
  // supaya mengetik di luar input tidak mengotori kolom pencarian.
  useEffect(() => {
    let buffer = ""

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return
      }

      buffer = (buffer + e.key.toLowerCase()).slice(-EGG.length)
      if (buffer === EGG) {
        setEasterEgg(true)
        buffer = ""
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!easterEgg) return
    const timer = setTimeout(() => setEasterEgg(false), EGG_MS)
    return () => clearTimeout(timer)
  }, [easterEgg])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    // `?q=` baru dibaca oleh /projects kalau URL state-nya diimplementasikan
    // (audit #2 — belum). Sampai itu jadi, parameter ini diabaikan.
    router.push(`/projects?q=${encodeURIComponent(q)}`)
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-lg text-center">
        <p className="font-mono text-7xl font-bold tracking-tighter text-blue-500/90 sm:text-9xl">
          404
        </p>

        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
          <Compass
            className={cn(
              "size-6 text-blue-600 transition-transform duration-700 dark:text-blue-400",
              easterEgg && "rotate-360"
            )}
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tidak ada halaman di alamat tersebut. Mungkin salah ketik, atau sudah
          dipindahkan.
        </p>

        <form onSubmit={submit} className="mt-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari proyek…"
              aria-label="Cari proyek"
              className="h-10 pl-8"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim()}
              className="absolute right-1 top-1/2 h-8 -translate-y-1/2"
            >
              Cari
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className={cn(buttonVariants(), "gap-1.5")}>
            <Home className="size-4" aria-hidden="true" />
            Ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            Dashboard
          </Link>
        </div>
      </div>

      {easterEgg && (
        <p
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 inline-flex -translate-x-1/2 animate-in items-center gap-1.5 rounded-full border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground fade-in slide-in-from-bottom-2"
        >
          <Sparkle className="size-3.5" aria-hidden="true" />
          OmniStack mode aktif
        </p>
      )}
    </main>
  )
}
