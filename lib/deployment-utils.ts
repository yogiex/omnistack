import type { DeploymentStatus, MockProject } from "@/lib/mock-data"

/**
 * Status yang ditampilkan di UI. `MockDeployment.status` belum punya
 * `rolled_back` — status itu diturunkan dari log (lihat `getEffectiveStatus`),
 * jadi harus tetap union terpisah, bukan `string`, supaya filter switch
 * bisa exhaustive-check.
 */
export type EffectiveDeploymentStatus = DeploymentStatus | "rolled_back"

/** Tampilan tabel: list atau timeline. Dipakai bersama hook + filter bar. */
export type DeployView = "list" | "timeline"

export type DeploymentEnvironment = "production" | "staging" | "preview"

type DeploymentLike = { status: DeploymentStatus; logLines: string[] }

/**
 * Status efektif — `success` + log mengandung "Rollback" = rolled_back.
 */
export function getEffectiveStatus(
  d: DeploymentLike,
): EffectiveDeploymentStatus {
  if (
    d.status === "success" &&
    d.logLines.some((l) => l.includes("Rollback"))
  ) {
    return "rolled_back"
  }
  return d.status
}

/* -------------------------------------------------------------------------- */
/*  Time label → detik                                                        */
/* -------------------------------------------------------------------------- */

const SECONDS = {
  detik: 1,
  menit: 60,
  jam: 3600,
  hari: 86400,
  minggu: 604800,
  bulan: 2592000,
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  hour: 3600,
  hours: 3600,
  day: 86400,
  days: 86400,
} as const

type TimeUnit = keyof typeof SECONDS

/** Di-return untuk label yang tidak dikenali → selalu urut paling akhir. */
export const UNKNOWN_AGE_SECONDS = Number.MAX_SAFE_INTEGER

/**
 * Konversi "5 menit lalu" → 300, untuk sorting kronologis.
 *
 * `timeLabel` di mock data sudah berupa teks ("3 jam lalu"), bukan
 * timestamp, jadi ini satu-satunya cara sort tanpa mengubah model data.
 * Kalau backend sudah menyetor `startedAt` (yang sudah ada di
 * `MockDeployment`), parse `Date.parse(startedAt)` saja dan buang fungsi ini.
 */
export function timeLabelToSecondsAgo(label: string): number {
  const normalized = label.trim().toLowerCase()

  if (normalized === "baru saja" || normalized === "just now") return 0
  if (normalized.includes("kemarin") || normalized.includes("yesterday")) {
    return SECONDS.hari
  }

  const match = normalized.match(
    /(\d+)\s*(detik|menit|jam|hari|minggu|bulan|seconds?|minutes?|hours?|days?)/,
  )
  if (!match) return UNKNOWN_AGE_SECONDS

  const unit = match[2] as TimeUnit
  return Number(match[1]) * (SECONDS[unit] ?? 1)
}

/** Nama project dari ID — fallback ke ID kalau tidak ketemu. */
export function getProjectName(
  projectId: string,
  projects: readonly Pick<MockProject, "id" | "name">[],
): string {
  return projects.find((p) => p.id === projectId)?.name ?? projectId
}
