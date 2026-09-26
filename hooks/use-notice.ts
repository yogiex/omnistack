"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const AUTO_DISMISS_MS = 3000

/**
 * Notifikasi transien untuk aksi mock. Auto-dismiss 3 detik, timer
 * dibersihkan saat unmount supaya tidak ada setState setelah unmount.
 *
 * Shared antar page (projects, users, dst) — hook ini murni state lokal,
 * tidak ada dependensi ke domain tertentu.
 */
export function useNotice() {
  const [notice, setNotice] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setNotice(null), AUTO_DISMISS_MS)
  }, [])

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setNotice(null)
  }, [])

  return { notice, showNotice, dismiss }
}
