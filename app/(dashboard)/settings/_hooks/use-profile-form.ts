"use client"

import { useCallback, useState } from "react"

interface UseProfileFormArgs {
  initialName: string
  /**
   * Default 2FA. `false` — audit mencatat tidak ada user yang benar-benar
   * ter-enroll, jadi menampilkan "Aktif" tanpa enrollment hanya memalsukan
   * data. Toggle ON harus lewat flow enrollment.
   */
  initial2FA?: boolean
}

export function useProfileForm({
  initialName,
  initial2FA = false,
}: UseProfileFormArgs) {
  const [name, setName] = useState("")
  const [twoFAEnabled, setTwoFAEnabled] = useState(initial2FA)

  /** Nama tidak boleh kosong, dan harus benar-benar berbeda dari nilai awal. */
  const isDirty = name.trim() !== "" && name.trim() !== initialName

  const reset = useCallback(() => {
    setName("")
    setTwoFAEnabled(initial2FA)
  }, [initial2FA])

  return {
    name,
    setName,
    twoFAEnabled,
    setTwoFAEnabled,
    isDirty,
    reset,
  }
}
