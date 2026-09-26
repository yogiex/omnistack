import { BellRing, DollarSign, Gauge, HardDrive } from "lucide-react"

import type { KpiGridConfig } from "@/lib/kpi/types"
import type { CostTrendPoint, FinOpsOverview } from "@/lib/mock-finops"
import type { Role } from "@/lib/mock-data"
import { formatUSD } from "@/lib/utils"

export interface FinOpsAlertSummary {
  total: number
  critical: number
  warning: number
}

export interface FinOpsKpiData {
  overview: FinOpsOverview
  trend: CostTrendPoint[]
  role: Role
  alerts: FinOpsAlertSummary
}

const pct = (value: number, total: number): number =>
  total === 0 ? 0 : (value / total) * 100

export const finopsKpis: KpiGridConfig<FinOpsKpiData> = {
  cols: 4,
  title: "Ringkasan Biaya",
  description: "Akumulasi 30 hari terakhir",
  items: [
    {
      id: "total-cost",
      label: "Total Biaya",
      accent: "amber",
      icon: <DollarSign />,
      value: (d) => formatUSD(d.overview.totalCost, 0),
      trend: (d) => (d.overview.trend < 0 ? "down" : "up"),
      trendValue: (d) => `${Math.abs(d.overview.trend).toFixed(1)}%`,
      trendLabel: (d) =>
        d.role === "VIEWER"
          ? "vs periode sebelumnya (read-only)"
          : "vs periode sebelumnya",
      tooltip: "Total biaya compute, storage, network, dan database.",
      sparkline: (d) => d.trend.map((p) => p.total),
    },
    {
      id: "budget-usage",
      label: "Penggunaan Budget",
      accent: "violet",
      icon: <Gauge />,
      value: (d) =>
        d.overview.budget === 0
          ? "—"
          : `${Math.round(pct(d.overview.totalCost, d.overview.budget))}%`,
      progress: (d) =>
        Math.min(100, pct(d.overview.totalCost, d.overview.budget)),
      trendValue: (d) => formatUSD(Math.max(0, d.overview.budget - d.overview.totalCost), 0),
      trendLabel: (d) =>
        d.overview.budget === 0
          ? "Budget belum diatur"
          : `Sisa dari ${formatUSD(d.overview.budget, 0)}`,
      tooltip: "Persentase budget bulanan yang sudah terpakai.",
    },
    {
      id: "active-alerts",
      label: "Alerts Aktif",
      accent: "rose",
      icon: <BellRing />,
      value: (d) => d.alerts.total.toLocaleString("id-ID"),
      trendLabel: (d) =>
        d.alerts.total === 0
          ? "Tidak ada alert aktif"
          : [
              d.alerts.critical > 0
                ? `${d.alerts.critical} kritis`
                : "tanpa alert kritis",
              `${d.alerts.warning} peringatan`,
            ].join(" · "),
      tooltip:
        "Jumlah alert anggaran yang aktif pada data yang terlihat oleh role Anda.",
      href: "#budget-alerts",
    },
    {
      id: "storage-usage",
      label: "Storage Terpakai",
      accent: "blue",
      icon: <HardDrive />,
      value: (d) => `${d.overview.storageUsedGb.toLocaleString("id-ID")} GB`,
      trend: (d) => (d.overview.storageGrowthGb < 0 ? "down" : "up"),
      trendValue: (d) =>
        `${d.overview.storageGrowthGb < 0 ? "" : "+"}${d.overview.storageGrowthGb.toFixed(1)} GB`,
      trendLabel: "pertumbuhan periode ini",
      tooltip: "Volume storage terpakai lintas proyek.",
    },
  ],
}
