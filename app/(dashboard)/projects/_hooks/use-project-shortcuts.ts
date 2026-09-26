"use client"

import { useEffect, type RefObject } from "react"

interface UseProjectShortcutsArgs {
  canCreate: boolean
  onCreate: () => void
  searchRef: RefObject<HTMLInputElement | null>
}

/** Shortcut: `N` = proyek baru, `/` = fokus pencarian. */
export function useProjectShortcuts({
  canCreate,
  onCreate,
  searchRef,
}: UseProjectShortcutsArgs) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable

      if (isTyping) return
      // Jangan rebut shortcut browser (Cmd/Ctrl+N, Cmd/Ctrl+/).
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if ((e.key === "n" || e.key === "N") && canCreate) {
        e.preventDefault()
        onCreate()
      }
      if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [canCreate, onCreate, searchRef])
}
