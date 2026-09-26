"use client"

import { useCallback, useMemo, useState } from "react"

import {
  getMockDeploymentsForRole,
  getMockProjectsByUser,
  type MockDeployment,
  type MockProject,
  type Role,
} from "@/lib/mock-data"
import type { DeploymentEnvironment } from "@/lib/deployment-utils"

interface UseDeploymentsArgs {
  userId: string | undefined
  role: Role | undefined
}

export interface NewDeploymentInput {
  projectId: string
  branch: string
  environment: DeploymentEnvironment
}

/** Kunci seed — reset seluruh list kalau user berubah. */
const seedKey = (userId: string, role: Role) => `${userId}:${role}`

/**
 * State + mutasi untuk daftar deployment.
 *
 * Setiap mutasi menolak kalau role bukan ADMIN/USER dan mengembalikan
 * `undefined` — pemanggil wajib mengecek hasilnya, jadi VIEWER tidak bisa
 * mengubah data. Meskipun UI-nya sudah disembunyikan, guard di sini yang
 * jadi sumber kebenaran.
 */
export function useDeployments({ userId, role }: UseDeploymentsArgs) {
  const [seed, setSeed] = useState<{
    key: string | null
    deployments: MockDeployment[]
  }>({ key: null, deployments: [] })

  // `getMockDeploymentsForRole` sinkron, jadi tidak ada lagi `useEffect`
  // + `await Promise.resolve()` palsu. Kalau user berubah, seed di-reset
  // saat render (pola "adjust state when props change" dari React docs) —
  // dipakai juga di `invite-user-dialog.tsx` dan `delete-user-dialog.tsx`.
  const key = userId && role ? seedKey(userId, role) : null
  if (key !== seed.key) {
    setSeed({
      key,
      deployments:
        userId && role
          ? getMockDeploymentsForRole(userId, role)
          : [],
    })
  }

  const deployments = seed.deployments

  const projects: MockProject[] = useMemo(
    () => (userId && role ? getMockProjectsByUser(userId, role) : []),
    [userId, role],
  )

  const canWrite = role === "ADMIN" || role === "USER"

  /* ------------------------------------------------------------------ */
  /*  Mutations                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Hasil mutasi dihitung dari `deployments` saat ini, baru ditulis ke
   * state — bukan dibaca keluar dari dalam `updater`, karena menulis ke
   * closure dari dalam `setState` memasukkan side effect ke pure function
   * dan `StrictMode` boleh memanggil updater lebih dari sekali.
   * Mengembalikan `undefined` kalau id tidak ada, jadi pemanggil bisa
   * membedakan "ditolak" dari "tidak ditemukan".
   */
  const patchDeployment = useCallback(
    (
      deploymentId: string,
      patch: (d: MockDeployment) => MockDeployment,
    ): MockDeployment | undefined => {
      if (!canWrite) return undefined
      const target = deployments.find((d) => d.id === deploymentId)
      if (!target) return undefined
      const updated = patch(target)
      setSeed((prev) => ({
        ...prev,
        deployments: prev.deployments.map((d) =>
          d.id === deploymentId ? updated : d,
        ),
      }))
      return updated
    },
    [canWrite, deployments],
  )

  const rollback = useCallback(
    (deploymentId: string, reason: string) =>
      patchDeployment(deploymentId, (d) => ({
        ...d,
        status: "success",
        logLines: [
          ...d.logLines,
          `✓ Rollback successful${reason ? ` (${reason})` : ""}`,
        ],
      })),
    [patchDeployment],
  )

  const cancel = useCallback(
    (deploymentId: string) =>
      patchDeployment(deploymentId, (d) => ({
        ...d,
        status: "failed",
        logLines: [...d.logLines, "✗ Cancelled by user"],
      })),
    [patchDeployment],
  )

  const retry = useCallback(
    (deploymentId: string): MockDeployment | undefined => {
      if (!canWrite) return undefined

      const source = deployments.find((d) => d.id === deploymentId)
      if (!source) return undefined

      const next: MockDeployment = {
        ...source,
        // `crypto.randomUUID()`, bukan `Date.now()` — dua retry dalam
        // milidetik yang sama bentrok dan menimpa `key` di tabel.
        id: `deploy-retry-${crypto.randomUUID()}`,
        status: "building",
        timeLabel: "baru saja",
        pipeline: source.pipeline.map((s, i) => ({
          ...s,
          status: i === 0 ? "running" : "pending",
          durationSeconds: undefined,
        })),
      }
      setSeed((prev) => ({
        ...prev,
        deployments: [next, ...prev.deployments],
      }))
      return next
    },
    [canWrite, deployments],
  )

  const createDeployment = useCallback(
    (input: NewDeploymentInput): MockDeployment | undefined => {
      if (!canWrite || !userId) return undefined
      if (!projects.some((p) => p.id === input.projectId)) return undefined

      const now = new Date().toISOString()
      const next: MockDeployment = {
        id: `deploy-${crypto.randomUUID()}`,
        projectId: input.projectId,
        branch: input.branch,
        commitMessage: "New deployment triggered from dashboard",
        commitSha: crypto.randomUUID().replace(/-/g, "").slice(0, 7),
        status: "building",
        triggeredBy: userId,
        authorEmail: userId,
        trigger: "manual",
        timeLabel: "baru saja",
        environment: input.environment,
        startedAt: now,
        durationSeconds: undefined,
        pipeline: [
          { name: "Clone repository", status: "running", logs: ["Cloning..."] },
          { name: "Install dependencies", status: "pending", logs: [] },
          { name: "Run tests", status: "pending", logs: [] },
          { name: "Build image", status: "pending", logs: [] },
          { name: "Deploy", status: "pending", logs: [] },
        ],
        logLines: ["$ omnistack deploy", "→ Starting deployment..."],
      }
      setSeed((prev) => ({
        ...prev,
        deployments: [next, ...prev.deployments],
      }))
      return next
    },
    [canWrite, userId, projects],
  )

  /* ------------------------------------------------------------------ */
  /*  Derived                                                            */
  /* ------------------------------------------------------------------ */

  const activeDeployments = useMemo(
    () =>
      deployments.filter(
        (d) => d.status === "building" || d.status === "queued",
      ),
    [deployments],
  )

  return {
    deployments,
    projects,
    canWrite,
    activeDeployments,
    rollback,
    retry,
    cancel,
    createDeployment,
  }
}
