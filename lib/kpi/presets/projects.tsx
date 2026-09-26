import { Boxes, CircleCheck, CircleX, LoaderCircle } from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"

export interface ProjectsKpiData {
  total: number
  live: number
  building: number
  failed: number
}

const pct = (n: number, total: number) =>
  total > 0 ? `${Math.round((n / total) * 100)}% dari total` : "—"

/**
 * KPI daftar proyek. Digantikan `ProjectsStats` (audit: dua sistem KPI
 * berbeda untuk data yang sama). Hanya dirender untuk ADMIN — USER/VIEWER
 * memakai KpiCard langsung di halaman detail.
 */
export const projectsKpis: KpiGridConfig<ProjectsKpiData> = {
  cols: 4,
  title: "Ringkasan Proyek",
  items: [
    {
      id: "total",
      label: "Total Proyek",
      accent: "blue",
      icon: <Boxes />,
      value: (d) => d.total,
      tooltip: "Seluruh proyek yang terlihat oleh akun ini, lintas status.",
    },
    {
      id: "live",
      label: "Live",
      accent: "emerald",
      icon: <CircleCheck />,
      value: (d) => d.live,
      trendLabel: (d) => pct(d.live, d.total),
      progress: (d) => (d.total === 0 ? 0 : (d.live / d.total) * 100),
      tooltip: "Proyek dengan status aktif.",
    },
    {
      id: "building",
      label: "Building",
      accent: "amber",
      icon: <LoaderCircle />,
      value: (d) => d.building,
      trendLabel: "sedang dideploy",
      progress: (d) =>
        d.total === 0 ? 0 : (d.building / d.total) * 100,
      tooltip: "Proyek yang deployment-nya sedang berjalan.",
    },
    {
      id: "failed",
      label: "Failed",
      accent: "rose",
      icon: <CircleX />,
      value: (d) => d.failed,
      trendLabel: (d) => pct(d.failed, d.total),
      progress: (d) => (d.total === 0 ? 0 : (d.failed / d.total) * 100),
      tooltip: "Proyek dengan deployment terakhir yang gagal.",
    },
  ],
}
