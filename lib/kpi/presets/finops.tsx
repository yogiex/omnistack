import {
  AlertTriangle,
  Cpu,
  DollarSign,
  Gauge,
  HardDrive,
  Network,
  TrendingUp,
} from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"
import type {
  CostTrendPoint,
  FinOpsOverview,
  Role,
} from "@/lib/mock-data"

export interface FinOpsKpiData {
  overview: FinOpsOverview
  trend: CostTrendPoint[]
  role: Role
}

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

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
      value: (d) => currency(d.overview.totalCost),
      trend: (d) => (d.overview.trend < 0 ? "down" : "up"),
      trendValue: (d) => `${Math.abs(d.overview.trend).toFixed(1)}%`,
      trendLabel: "vs periode sebelumnya",
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
          : `${Math.round((d.overview.totalCost / d.overview.budget) * 100)}%`,
      progress: (d) =>
        d.overview.budget === 0
          ? 0
          : Math.min(100, (d.overview.totalCost / d.overview.budget) * 100),
      tooltip: "Persentase budget bulanan yang sudah terpakai.",
      href: "/finops",
    },
    {
      id: "compute",
      label: "Compute",
      accent: "blue",
      icon: <Cpu />,
      value: (d) => currency(d.overview.computeCost),
      tooltip: "Biaya CPU dan RAM across semua node.",
    },
    {
      id: "storage",
      label: "Storage",
      accent: "default",
      icon: <HardDrive />,
      value: (d) => currency(d.overview.storageCost),
      tooltip: "Biaya penyimpanan block dan object storage.",
    },
    {
      id: "network",
      label: "Network",
      accent: "default",
      icon: <Network />,
      value: (d) => currency(d.overview.networkCost),
      tooltip: "Biaya egress dan transfer antar node.",
    },
    {
      id: "storage-usage",
      label: "Storage Terpakai",
      accent: "default",
      icon: <HardDrive />,
      value: (d) => `${d.overview.storageUsedGb.toFixed(0)} GB`,
      trend: (d) => (d.overview.storageGrowthGb < 0 ? "down" : "up"),
      trendValue: (d) =>
        `${Math.abs(d.overview.storageGrowthGb).toFixed(1)} GB`,
      trendLabel: "pertumbuhan periode ini",
      tooltip: "Volume storage terpakai lintas proyek.",
    },
    {
      id: "db-slow-queries",
      label: "Slow Queries",
      accent: "rose",
      icon: <AlertTriangle />,
      value: (d) => d.overview.dbSlowQueries.toLocaleString("id-ID"),
      tooltip: "Query database yang melampaui ambang latency.",
      visible: (d) => d.overview.dbSlowQueries > 0,
    },
    {
      id: "cost-trend",
      label: "Tren Biaya",
      accent: "emerald",
      icon: <TrendingUp />,
      value: (d) => (d.overview.trend < 0 ? "Efisien" : "Naik"),
      trend: (d) => (d.overview.trend < 0 ? "down" : "up"),
      tooltip:
        "Membandingkan biaya periode ini terhadap periode sebelumnya.",
    },
  ],
}
