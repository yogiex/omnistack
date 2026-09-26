import { Activity, FolderGit2, Rocket, ShieldCheck, Users } from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"

export interface AdminKpiData {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalDeployments: number
  roleCounts: Record<"ADMIN" | "USER" | "VIEWER", number>
}

/**
 * KPI admin console. Semua angka diturunkan dari mock layer.
 * "System Health" sengaja `disabled` — angka uptime saat ini hardcoded
 * di `admin-overview.tsx` dan tidak berasal dari data nyata.
 */
export const adminKpis: KpiGridConfig<AdminKpiData> = {
  cols: 4,
  title: "Ringkasan Sistem",
  items: [
    {
      id: "total-users",
      label: "Total User",
      accent: "blue",
      icon: <Users />,
      value: (d) => d.totalUsers,
      tooltip: "Seluruh akun terdaftar, termasuk yang nonaktif.",
      href: "/admin/users",
    },
    {
      id: "active-users",
      label: "User Aktif",
      accent: "emerald",
      icon: <ShieldCheck />,
      value: (d) => d.activeUsers,
      progress: (d) =>
        d.totalUsers === 0 ? 0 : (d.activeUsers / d.totalUsers) * 100,
      tooltip: "Akun dengan status aktif, dari seluruh user terdaftar.",
    },
    {
      id: "total-projects",
      label: "Total Proyek",
      accent: "violet",
      icon: <FolderGit2 />,
      value: (d) => d.totalProjects,
      tooltip: "Proyek milik seluruh user, lintas role.",
      href: "/projects",
    },
    {
      id: "total-deployments",
      label: "Total Deployment",
      accent: "amber",
      icon: <Rocket />,
      value: (d) => d.totalDeployments,
      tooltip: "Akumulasi deployment dari seluruh proyek dalam sistem.",
      href: "/deployments",
    },
    {
      id: "system-health",
      label: "System Health",
      accent: "default",
      icon: <Activity />,
      value: "—",
      tooltip:
        "Mengheartbeat agent di setiap VPS node. Belum ada agent yang terhubung.",
      disabled: { reason: "Segera hadir — butuh heartbeat dari VPS node" },
    },
  ],
}
