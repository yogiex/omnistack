"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  INITIAL_API_KEYS,
  type ApiKeyItem,
} from "@/lib/settings/mock-settings"

/**
 * Suffix hex dari CSPRNG browser, bukan `Math.random()`.
 * `Math.random()` bukan cryptographically secure dan bisa di-pattern; untuk
 * material yang akan jadi bearer token itu tidak boleh dipakai.
 */
function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("")
}

const COPY_FEEDBACK_MS = 1500

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const generate = useCallback(() => {
    const next: ApiKeyItem = {
      // `crypto.randomUUID()`, bukan `Date.now()` — dua klik dalam milidetik
      // yang sama akan menghasilkan id yang bentrok.
      id: `key-${crypto.randomUUID()}`,
      name: "Untitled Key",
      fullKey: `osk_live_${randomHex(8)}`,
      createdAt: "Baru saja",
    }
    setKeys((prev) => [...prev, next])
    return next
  }, [])

  const revoke = useCallback((id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }, [])

  /**
   * Hanya `navigator.clipboard` — fallback `document.execCommand("copy")`
   * sudah deprecated dan tidak ada lagi di beberapa browser. Kalau API-nya
   * tidak ada (konteks non-secure), kembalikan `false` supaya UI bisa
   * memberi tahu user untuk menyalin manual, bukan diam-diam tidak menyalin.
   */
  const copy = useCallback(async (key: ApiKeyItem): Promise<boolean> => {
    if (!navigator.clipboard) return false
    try {
      await navigator.clipboard.writeText(key.fullKey)
    } catch {
      return false
    }
    setCopiedId(key.id)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopiedId(null), COPY_FEEDBACK_MS)
    return true
  }, [])

  return { keys, copiedId, generate, revoke, copy }
}
