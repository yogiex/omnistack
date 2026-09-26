import type { ErrorSeverity, ErrorStatus } from "@/lib/mock-errors"

/**
 * Peta warna semantik untuk status & severity.
 *
 * Sebelumnya warna ditulis langsung di komponen sebagai `text-red-500`,
 * `text-yellow-500`, `text-green-500`. Kelas `text-red-500` dan
 * `text-destructive` itu tidak sama: `destructive` ikut berubah saat
 * palette diganti, `red-500` tidak. Badge jadi terlihat beda antara
 * light dan dark dan antar palette.
 *
 * Semua nilai tetap kelas Tailwind (bukan hex) supaya variant `dark:`
 * dan opacity modifier (`/10`) tetap bisa dipakai.
 */

export type Tone = {
  text: string
  bg: string
  ring: string
  dot: string
}

export const STATUS_TONE: Record<ErrorStatus, Tone> = {
  New: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
    dot: "bg-rose-500",
  },
  Investigating: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
  },
  Resolved: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
}

export type SeverityTone = Omit<Tone, "dot">

export const SEVERITY_TONE: Record<ErrorSeverity, SeverityTone> = {
  Critical: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
  },
  Warning: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
  Info: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
}
