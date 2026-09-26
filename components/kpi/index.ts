/**
 * Entry point untuk seluruh KPI di OmniStack.
 *
 * Prinsip: halaman TIDAK boleh merakit card KPI sendiri. Cukup
 *   import { KpiSection } from "@/components/kpi"
 *   import { dashboardKpis } from "@/lib/kpi/presets/dashboard"
 *
 * Lihat ARCHITECTURE.md §Component Architecture untuk pola yang sama
 * pada layer komponen biasa.
 */

export { KpiCard, type KpiCardProps } from "@/components/kpi/kpi-card"
export { KpiCardSkeleton } from "@/components/kpi/kpi-card-skeleton"
export { KpiGrid } from "@/components/kpi/kpi-grid"
export { KpiSection } from "@/components/kpi/kpi-section"

export type {
  KpiAccent,
  KpiGridConfig,
  KpiItem,
  KpiTrend,
} from "@/lib/kpi/types"
