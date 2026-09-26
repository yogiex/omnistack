"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  DEFAULT_PALETTE,
  PALETTES,
  PALETTE_STORAGE_KEY,
  type PaletteId,
} from "./palettes"

interface PaletteContextValue {
  palette: PaletteId
  setPalette: (p: PaletteId) => void
  /** `true` setelah effect pertama berjalan — pakai sebagai guard anti hydration mismatch. */
  mounted: boolean
}

const PaletteContext = createContext<PaletteContextValue | undefined>(undefined)

/** Baca palette tersimpan dari localStorage. `null` bila kosong, tidak terbaca, atau isinya bukan palette yang dikenal. */
function readStoredPalette(): PaletteId | null {
  try {
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (!raw) return null
    return PALETTES.some((p) => p.id === raw) ? (raw as PaletteId) : null
  } catch {
    return null
  }
}

/** Terapkan `data-palette` ke `<html>` dan simpan ke localStorage. */
function applyPalette(palette: PaletteId): void {
  try {
    document.documentElement.setAttribute("data-palette", palette)
  } catch {
    // DOM tidak bisa diakses (mis. SSR/prerender) — abaikan.
  }
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, palette)
  } catch {
    // localStorage penuh atau diblokir (private mode) — abaikan.
  }
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE)
  const [mounted, setMounted] = useState(false)

  // Hydrate dari localStorage hanya setelah mount supaya render server & client
  // menghasilkan HTML yang sama (tidak membaca localStorage saat render).
  // Nilai dibaca lewat microtask agar tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      await Promise.resolve()
      if (cancelled) return

      const stored = readStoredPalette()
      if (stored) {
        setPaletteState(stored)
      }
      setMounted(true)
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  // Efek terpisah: sinkronkan atribut + penyimpanan setiap perubahan palette.
  useEffect(() => {
    if (!mounted) return
    applyPalette(palette)
  }, [palette, mounted])

  const setPalette = useCallback((p: PaletteId) => {
    setPaletteState(p)
  }, [])

  const value = useMemo<PaletteContextValue>(
    () => ({ palette, setPalette, mounted }),
    [palette, setPalette, mounted]
  )

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  )
}

export function usePalette(): PaletteContextValue {
  const context = useContext(PaletteContext)
  if (!context) {
    throw new Error("usePalette harus dipakai di dalam PaletteProvider")
  }
  return context
}
