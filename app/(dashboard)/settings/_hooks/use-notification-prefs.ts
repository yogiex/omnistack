"use client"

import { useCallback, useState } from "react"

import {
  INITIAL_NOTIF_PREFS,
  type NotifPrefs,
} from "@/lib/settings/mock-settings"

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotifPrefs>(INITIAL_NOTIF_PREFS)
  const [isDirty, setIsDirty] = useState(false)

  const toggle = useCallback((key: keyof NotifPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    setPrefs(INITIAL_NOTIF_PREFS)
    setIsDirty(false)
  }, [])

  const markSaved = useCallback(() => setIsDirty(false), [])

  return { prefs, toggle, isDirty, reset, markSaved }
}
