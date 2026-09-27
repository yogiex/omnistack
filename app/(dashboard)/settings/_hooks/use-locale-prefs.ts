"use client"

import { useCallback, useState } from "react"

import type { ThemeOption } from "@/lib/settings/constants"

const DEFAULT_LANGUAGE = "id"
const DEFAULT_TIMEZONE = "Asia/Jakarta"

export function useLocalePrefs() {
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE)
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE)
  const [isDirty, setIsDirty] = useState(false)

  const changeLanguage = useCallback((value: string) => {
    setLanguage(value)
    setIsDirty(true)
  }, [])

  const changeTimezone = useCallback((value: string) => {
    setTimezone(value)
    setIsDirty(true)
  }, [])

  const markSaved = useCallback(() => setIsDirty(false), [])

  return {
    language,
    timezone,
    isDirty,
    changeLanguage,
    changeTimezone,
    markSaved,
  }
}

export type { ThemeOption }
