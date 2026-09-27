"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Flag boolean yang otomatis kembali ke `false` setelah `durationMs`.
 *
 * Menggantikan pola `setX(true); setTimeout(() => setX(false), 2000)` yang
 * tersebar di banyak handler. Timer disimpan di ref dan dibersihkan saat
 * unmount — versi lama memanggil `setState` pada komponen yang sudah tidak
 * ada kalau user pindah halaman sebelum timer-nya habis.
 */
export function useTransientFlag(durationMs = 2000) {
  const [isOn, setIsOn] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const flash = useCallback(() => {
    setIsOn(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsOn(false), durationMs)
  }, [durationMs])

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOn(false)
  }, [])

  return { isOn, flash, clear }
}
