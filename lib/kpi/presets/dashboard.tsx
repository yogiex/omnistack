import {
  Activity,
  Boxes,
  CircleAlert,
  FolderGit2,
  Rocket,
  Users,
} from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"
import type { MockProject, Role } from "@/lib/mock-data"

export interface DashboardKpiData {
  projects: MockProject[]
  totalDeployments: number
  totalUsers: number
  role: Role
}

function projectLabel(role: Role): string {
  if (role === "ADMIN") return "Total Proyek"
  if (role === "VIEWER") return "Proyek Di-share"
  return "Proyek Saya"
}

/**
 * KPI dashboard. Seluruh angka berasal dari mock layer yang sudah ada —
 * tidak ada metrik yang dikarang di sini. Metrik yang belum tersedia
 * (uptime, biaya) sengaja memakai `disabled` agar tidak memunculkan
 * angka palsu.
 */
export const dashboardKpis: KpiGridConfig<DashboardKpiData> = {
  cols: 4,
  hideWhenEmpty: true,
  items: [
    {
      id: "projects",
      label: (d) => projectLabel(d.role),
      accent: "blue",
      icon: <FolderGit2 />,
      value: (d) => d.projects.length,
      tooltip:
        "Jumlah proyek sesuai cakupan role: ADMIN melihat semua, USER hanya miliknya sendiri, VIEWER hanya yang di-share.",
      href: "/projects",
    },
    {
      id: "active-projects",
      label: "Proyek Live",
      accent: "emerald",
      icon: <Boxes />,
      value: (d) => d.projects.filter((p) => p.status === "active").length,
      tooltip: "Proyek dengan status \"active\" (badge: Live).",
      visible: (d) => d.role !== "VIEWER" && d.projects.length > 0,
    },
    {
      id: "deployments",
      label: "Total Deployments",
      accent: "violet",
      icon: <Rocket />,
      value: (d) => d.totalDeployments,
      tooltip: "Akumulasi jumlah deployment dari seluruh proyek dalam cakupan role.",
      href: "/deployments",
    },
    {
      id: "failed-projects",
      label: "Proyek Gagal",
      accent: "rose",
      icon: <CircleAlert />,
      value: (d) => d.projects.filter((p) => p.status === "failed").length,
      tooltip: "Proyek dengan status \"failed\" — perlu investigasi.",
      href: "/projects",
      visible: (d) => d.role !== "VIEWER" && d.projects.length > 0,
    },
    {
      id: "users",
      label: "Total User",
      accent: "default",
      icon: <Users />,
      value: (d) => d.totalUsers,
      tooltip: "Jumlah akun terdaftar. Hanya relevan untuk ADMIN.",
      href: "/admin/users",
      roles: ["ADMIN"],
    },
    {
      id: "uptime",
      label: "Uptime",
      accent: "default",
      icon: <Activity />,
      value: "—",
      tooltip:
        "Memerlukan metricsCollector dari VPS node. Belum ada backend yang mengumpulkan data ini.",
      disabled: {
        reason: "Segera hadir — butuh data dari VPS node",
      },
    },
  ],
}
