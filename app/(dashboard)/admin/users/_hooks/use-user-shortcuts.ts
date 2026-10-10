"use client"

import { useEffect } from "react"

interface UseUserShortcutsArgs {
  onFocusSearch: () => void
  onOpenInvite: () => void
  onClearSearch: () => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  )
}

/**
 * Keyboard shortcuts halaman User Management:
 * - `/` → fokus ke search (kecuali sedang mengetik)
 * - `n` → buka dialog invite (kecuali sedang mengetik)
 * - `Escape` → clear search
 */
export function useUserShortcuts({
  onFocusSearch,
  onOpenInvite,
  onClearSearch,
  searchInputRef,
}: UseUserShortcutsArgs) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      if (e.key === "/") {
        e.preventDefault()
        onFocusSearch()
      } else if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onOpenInvite()
      } else if (e.key === "Escape") {
        if (searchInputRef.current?.value) {
          e.preventDefault()
          onClearSearch()
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onFocusSearch, onOpenInvite, onClearSearch, searchInputRef])
}
