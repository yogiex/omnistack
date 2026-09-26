"use client"

import { useCallback, useMemo, useState } from "react"

import {
  getMockProjectsByUser,
  MOCK_USERS,
  type Role,
} from "@/lib/mock-data"
import type { ManagedProject } from "../_components/project-card"

interface UseProjectsArgs {
  userId: string | undefined
  role: Role | undefined
}

export interface CreateProjectInput {
  name: string
  description: string
  userId: string
}

/**
 * Single source of truth untuk daftar proyek di halaman ini.
 *
 * Catatan: `local-*` id sengaja memakai prefix itu karena route
 * `/projects/[id]` di static export hanya punya halaman untuk id yang
 * ada di mock layer — proyek yang dibuat sesi ini akan 404 saat dibuka.
 * Lihat `docs/audits/PROJECT-AUDIT.md` (C7) untuk generateStaticParams.
 */
function newLocalId() {
  return `local-${crypto.randomUUID()}`
}

export function useProjects({ userId, role }: UseProjectsArgs) {
  const userKey = userId && role ? `${userId}:${role}` : null

  const [projects, setProjects] = useState<ManagedProject[]>([])
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  // Mock layer sinkron, jadi tidak perlu efek: cukup muat ulang saat
  // identitas sesi berubah. Pola "adjust state saat input berubah"
  // (React docs — You Might Not Need an Effect).
  if (userKey && userKey !== loadedFor) {
    setLoadedFor(userKey)
    setProjects(getMockProjectsByUser(userId!, role!))
  }

  const ownerName = useCallback(
    (uid: string) => MOCK_USERS.find((u) => u.id === uid)?.name ?? "Unknown",
    []
  )

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      building: projects.filter((p) => p.status === "deploying").length,
      failed: projects.filter((p) => p.status === "failed").length,
    }),
    [projects]
  )

  const create = useCallback((input: CreateProjectInput): ManagedProject => {
    const project: ManagedProject = {
      id: newLocalId(),
      name: input.name,
      description: input.description,
      status: "active",
      userId: input.userId,
      createdAtLabel: "Baru saja",
      deployments: 0,
    }
    setProjects((prev) => [project, ...prev])
    return project
  }, [])

  const update = useCallback((id: string, patch: Partial<ManagedProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clone = useCallback((target: ManagedProject) => {
    const copy: ManagedProject = {
      ...target,
      id: newLocalId(),
      name: `${target.name} (Copy)`,
      archived: false,
      createdAtLabel: "Baru saja",
    }
    setProjects((prev) => [copy, ...prev])
    return copy
  }, [])

  const toggleArchive = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p))
    )
  }, [])

  const transfer = useCallback((id: string, newOwnerId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, userId: newOwnerId } : p))
    )
  }, [])

  const setStatus = useCallback(
    (id: string, status: ManagedProject["status"]) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                progress: status === "deploying" ? 10 : undefined,
                errorMessage: undefined,
              }
            : p
        )
      )
    },
    []
  )

  return {
    projects,
    isLoading: userKey === null,
    stats,
    ownerName,
    create,
    update,
    remove,
    clone,
    toggleArchive,
    transfer,
    setStatus,
  }
}
