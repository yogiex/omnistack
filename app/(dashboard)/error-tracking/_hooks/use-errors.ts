"use client"

import { useCallback, useMemo, useState } from "react"

import {
  MOCK_ERRORS,
  type ErrorStatus,
  type TrackedError,
} from "@/lib/mock-errors"

interface UseErrorsArgs {
  canWrite: boolean
}

export interface ErrorStats {
  totalOccurrences: number
  totalAffected: number
  open: number
  uniqueErrors: number
}

/**
 * State + mutasi untuk daftar error.
 *
 * Setiap mutasi mengembalikan `boolean` dan menolak kalau `canWrite`
 * false, jadi pemanggil bisa menampilkan umpan balik alih-alih diam-diam
 * tidak terjadi. Guard di sini, bukan hanya menyembunyikan tombol — RBAC
 * di `components/route-guard.tsx` masih client-side, jadi ini satu-satunya
 * lapis yang benar-benar menahan write.
 */
export function useErrors({ canWrite }: UseErrorsArgs) {
  const [errors, setErrors] = useState<TrackedError[]>(MOCK_ERRORS)

  const updateStatus = useCallback(
    (id: string, status: ErrorStatus): boolean => {
      if (!canWrite) return false
      setErrors((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e)),
      )
      return true
    },
    [canWrite],
  )

  const assignTo = useCallback(
    (id: string, assigneeId: string): boolean => {
      if (!canWrite) return false
      setErrors((prev) =>
        prev.map((e) => (e.id === id ? { ...e, assigneeId } : e)),
      )
      return true
    },
    [canWrite],
  )

  const unassign = useCallback(
    (id: string): boolean => {
      if (!canWrite) return false
      setErrors((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e
          // `assigneeId` dihapus, bukan di-set ke string kosong — `undefined`
          // adalah nilai "belum ada assignee" di tipe ini.
          return { ...e, assigneeId: undefined }
        }),
      )
      return true
    },
    [canWrite],
  )

  /**
   * `totalAffected` dijumlahkan, bukan dihitung sebagai user unik.
   *
   * Versi sebelumnya membuat `new Set(flatMap(Array.from({ length:
   * affectedUsers })))` — 664 elemen string yang semuanya pasti unik
   * karena key-nya `${errorId}-user-${i}`, jadi hasilnya identik dengan
   * penjumlahan biasa, hanyaauh Toolbox tidak perlu. Angka ini adalah
   * "akumulasi per-error", bukan pengguna unik — kartu UI menyatakan
   * sebaliknya supaya tidak menyesatkan.
   */
  const stats = useMemo<ErrorStats>(() => {
    let totalOccurrences = 0
    let totalAffected = 0
    let open = 0

    for (const e of errors) {
      totalOccurrences += e.count
      totalAffected += e.affectedUsers
      if (e.status !== "Resolved") open++
    }

    return {
      totalOccurrences,
      totalAffected,
      open,
      uniqueErrors: errors.length,
    }
  }, [errors])

  return { errors, stats, updateStatus, assignTo, unassign }
}
