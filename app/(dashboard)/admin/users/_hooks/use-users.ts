"use client"

import { useCallback, useMemo, useState } from "react"

import {
  MOCK_USERS,
  getUserStatus,
  type MockUser,
  type Role,
} from "@/lib/mock-data"

interface UseUsersArgs {
  currentUserId: string | undefined
}

export type TwoFactorHandler = (id: string) => void

export function useUsers({ currentUserId }: UseUsersArgs) {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS)

  /**
   * 2FA disimpan terpisah karena `MockUser` belum punya field-nya.
   * Konsekuensi yang diketahui: status ini hilang saat refresh — pada
   * backend nyata ini akan jadi kolom di user record, bukan state client.
   */
  const [twofaIds, setTwofaIds] = useState<Set<string>>(new Set())

  /* ------------------------------------------------------------------ */
  /*  Derived                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Jumlah ADMIN yang benar-benar aktif. ADMIN berstatus "invited" atau
   * "suspended" tidak dihitung — dia belum bisa login, jadi tidak
   * bisa administer sistem. Semua guard di bawah memakai angka ini,
   * bukan `users.filter(role === "ADMIN").length`.
   */
  const activeAdminCount = useMemo(
    () =>
      users.filter(
        (u) => u.role === "ADMIN" && u.isActive && getUserStatus(u) === "active",
      ).length,
    [users],
  )

  const isSelf = useCallback(
    (u: MockUser) => u.email === currentUserId,
    [currentUserId],
  )

  /* ------------------------------------------------------------------ */
  /*  Guards — single source of truth untuk aturan bisnis                */
  /* ------------------------------------------------------------------ */

  /**
   * Aturan "sisakan minimal satu ADMIN aktif". Dipakai oleh suspend,
   * delete, dan demote supaya ketiganya tidak bisa berbeda interpretasi.
   */
  const isLastActiveAdmin = useCallback(
    (target: MockUser) =>
      target.role === "ADMIN" &&
      target.isActive &&
      getUserStatus(target) === "active" &&
      activeAdminCount <= 1,
    [activeAdminCount],
  )

  const canSuspend = useCallback(
    (target: MockUser) => !isSelf(target) && !isLastActiveAdmin(target),
    [isSelf, isLastActiveAdmin],
  )

  const canDelete = useCallback(
    (target: MockUser) => !isSelf(target) && !isLastActiveAdmin(target),
    [isSelf, isLastActiveAdmin],
  )

  /**
   * Hanya mencegah demote ADMIN terakhir. Promote ke ADMIN selalu
   * boleh — menambah ADMIN tidak pernah mengurangi kapasitas sistem.
   */
  const canChangeRole = useCallback(
    (target: MockUser, newRole: Role) => {
      if (target.role !== "ADMIN" || newRole === "ADMIN") return true
      return activeAdminCount > 1
    },
    [activeAdminCount],
  )

  /** Case-insensitive, dan meng-exclude user yang sedang diedit. */
  const emailExists = useCallback(
    (email: string, excludeId?: string) => {
      const target = email.trim().toLowerCase()
      return users.some(
        (u) => u.id !== excludeId && u.email.toLowerCase() === target,
      )
    },
    [users],
  )

  /* ------------------------------------------------------------------ */
  /*  Mutations                                                          */
  /* ------------------------------------------------------------------ */

  const updateUser = useCallback(
    (
      id: string,
      patch: Partial<Pick<MockUser, "name" | "email" | "role">>,
    ) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      )
    },
    [],
  )

  const invite = useCallback((email: string, role: Role): MockUser => {
    const now = new Date().toISOString()
    const next: MockUser = {
      id: `user-invite-${crypto.randomUUID()}`,
      email: email.trim(),
      password: "",
      // Email bisa "//foo@bar" tanpa nama — `split("@")[0]` selalu string,
      // tapi `?? email` menjaga kalau domainnya kosong.
      name: email.split("@")[0] || email,
      role,
      isActive: false,
      status: "invited",
      invitedAt: now,
      createdAt: now,
    }
    setUsers((prev) => [...prev, next])
    return next
  }, []);

  const resendInvite = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, invitedAt: new Date().toISOString() } : u,
      ),
    )
  }, []);

  const cancelInvite = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, []);

  const toggleSuspend = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive, status: undefined } : u,
      ),
    )
  }, []);

  const remove = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const toggle2FA = useCallback((id: string) => {
    setTwofaIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const has2FA = useCallback((id: string) => twofaIds.has(id), [twofaIds])

  return {
    users,
    activeAdminCount,
    isSelf,
    has2FA,
    isLastActiveAdmin,
    canSuspend,
    canDelete,
    canChangeRole,
    emailExists,
    updateUser,
    invite,
    resendInvite,
    cancelInvite,
    toggleSuspend,
    toggle2FA,
    remove,
  }
}
