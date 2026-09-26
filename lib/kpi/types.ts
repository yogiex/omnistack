import type { ReactNode } from "react"
import type { Role } from "@/lib/mock-data"

export type KpiTrend = "up" | "down" | "flat"

export type KpiAccent =
  | "default"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"

export interface KpiItem<TData = unknown> {
  /** ID unik untuk React key + analytics */
  id: string
  /**
   * Label utama. Bisa berupa fungsi bila label berbeda per role
   * (mis. "Proyek Saya" untuk USER vs "Total Proyek" untuk ADMIN).
   */
  label: string | ((data: TData) => string)
  /** Value: statis atau turunan dari data runtime */
  value: ReactNode | ((data: TData) => ReactNode)
  /** Ikon Lucide (bukan react-icons, agar konsisten dengan UI element lain) */
  icon?: ReactNode
  /** Accent — maksimal 2 per view (DESIGN.md §Color) */
  accent?: KpiAccent
  /**
   * Arah tren. Bisa berupa fungsi bila arah bergantung pada data
   * (mis. biaya naik vs turun dibanding periode sebelumnya).
   */
  trend?: KpiTrend | ((data: TData) => KpiTrend)
  trendValue?: string | ((data: TData) => string)
  trendLabel?: string
  /** Isi tooltip */
  tooltip?: string
  /** Progress 0–100 */
  progress?: number | ((data: TData) => number)
  /** Data sparkline (minimal 2 titik untuk garis berarti) */
  sparkline?: number[] | ((data: TData) => number[])
  /** Role yang boleh melihat item ini — kosong = semua role */
  roles?: Role[]
  /** Route tujuan saat diklik — dibungkus `next/link` */
  href?: string
  /**
   * State jujur untuk fitur yang belum berfungsi.
   * Menggantikan pola "toast sukses palsu" yang ditemukan di audit.
   * Bisa berupa fungsi bila status ketergantungan pada data.
   */
  disabled?: { reason: string } | ((data: TData) => { reason: string } | undefined)
  /** Predicate visibilitas berbasis data */
  visible?: (data: TData) => boolean
}

export interface KpiGridConfig<TData = unknown> {
  /** Judul section opsional */
  title?: string
  description?: string
  /** Jumlah kolom di desktop */
  cols?: 2 | 3 | 4
  items: KpiItem<TData>[]
  /** Gate level section */
  roles?: Role[]
  /** Sembunyikan section bila semua item ter-filter habis */
  hideWhenEmpty?: boolean
}
