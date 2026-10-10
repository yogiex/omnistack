import { Activity, Moon, GitPullRequest, RadioTower } from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"

/**
 * Bentuk data untuk KPI GitOps. Sengaja memakai bentuk data yang sudah
 * dipakai `gitops-client.tsx` (array env dengan status) supaya preset ini
 * stateless dan bisa dipakai ulang di halaman lain tanpa mock layer baru.
 */
export interface GitOpsEnvLike {
  status: string
}

export interface GitOpsKpiData {
  envs: readonly GitOpsEnvLike[]
}

/** Status preview environment yang dihitung di KPI. */
const LIVE = "LIVE"
const BUILDING = "BUILDING"
const SLEEPING = "SLEEPING"

function countBy(d: GitOpsKpiData, status: string): number {
  return d.envs.filter((env) => env.status === status).length
}

/**
 * KPI Preview Environments. Semua angka diturunkan dari `envs` (state
 * client-side), sehingga kartu ikut ter-update saat user membuat atau
 * menghapus preview env tanpa perlu reload.
 */
export const gitOpsKpis: KpiGridConfig<GitOpsKpiData> = {
  cols: 4,
  title: "Ringkasan Preview",
  description: "Status environment preview per Pull Request secara real-time.",
  items: [
    {
      id: "total-previews",
      label: "Preview Aktif",
      accent: "blue",
      icon: <GitPullRequest />,
      value: (d) => d.envs.length,
      tooltip:
        "Seluruh environment preview yang sedang aktif. Otomatis dihapus saat PR di-merge.",
    },
    {
      id: "live-previews",
      label: "Live",
      accent: "emerald",
      icon: <RadioTower />,
      value: (d) => countBy(d, LIVE),
      progress: (d) =>
        d.envs.length === 0 ? 0 : (countBy(d, LIVE) / d.envs.length) * 100,
      tooltip: "Preview env yang sedang melayani trafik dan bisa diakses publik.",
    },
    {
      id: "building-previews",
      label: "Building",
      accent: "default",
      icon: <Activity />,
      value: (d) => countBy(d, BUILDING),
      tooltip: "Preview env yang sedang di-deploy. URL belum bisa diakses.",
    },
    {
      id: "sleeping-previews",
      label: "Sleeping",
      accent: "default",
      icon: <Moon />,
      value: (d) => countBy(d, SLEEPING),
      tooltip:
        "Preview env yang sedang tidur untuk menghemat resource. Akan bangun otomatis saat diakses.",
    },
  ],
}