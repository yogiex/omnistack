import { Activity, Cpu, Globe, HeartPulse, MemoryStick, Timer } from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"

export interface MonitoringKpiData {
  /** Rata-rata CPU lintas node (persen) */
  cpuAvg: number | null
  /** Puncak CPU (persen) */
  cpuPeak: number | null
  /** Memori terpakai (GB) */
  memoryUsedGb: number | null
  /** Latensi p95 (ms) */
  latencyP95Ms: number | null
  /** Error rate (persen) */
  errorRate: number | null
  /** Jumlah node yang Terencekoh */
  onlineNodes: number
  /** Total node terdaftar */
  totalNodes: number
}

const unavailable = "—"
const unavailableReason = {
  reason: "Segera hadir — butuh metricsCollector dari VPS node",
} as const

/**
 * Monitoring KPI. Semua metrik nullable: bila collector belum terpasang,
 * item tampil sebagai state jujur (bukan angka 0 yang disamar jadi data).
 */
export const monitoringKpis: KpiGridConfig<MonitoringKpiData> = {
  cols: 4,
  title: "Kesehatan Infrastruktur",
  items: [
    {
      id: "nodes",
      label: "Node Online",
      accent: "emerald",
      icon: <Globe />,
      value: (d) => `${d.onlineNodes} / ${d.totalNodes}`,
      progress: (d) =>
        d.totalNodes === 0 ? 0 : (d.onlineNodes / d.totalNodes) * 100,
      tooltip: "Jumlah VPS node yang heartbeat aktif.",
      href: "/admin/infrastructure",
      roles: ["ADMIN"],
    },
    {
      id: "cpu",
      label: "CPU Rata-rata",
      accent: "blue",
      icon: <Cpu />,
      value: (d) =>
        d.cpuAvg === null ? unavailable : `${d.cpuAvg.toFixed(1)}%`,
      progress: (d) => d.cpuAvg ?? 0,
      tooltip: "Rata-rata utilisasi CPU lintas node.",
      disabled: (d) => (d.cpuAvg === null ? unavailableReason : undefined),
    },
    {
      id: "cpu-peak",
      label: "CPU Puncak",
      accent: "default",
      icon: <Activity />,
      value: (d) =>
        d.cpuPeak === null ? unavailable : `${d.cpuPeak.toFixed(1)}%`,
      tooltip: "Puncak utilisasi CPU dalam periode ini.",
      disabled: (d) => (d.cpuPeak === null ? unavailableReason : undefined),
    },
    {
      id: "memory",
      label: "Memori Terpakai",
      accent: "violet",
      icon: <MemoryStick />,
      value: (d) =>
        d.memoryUsedGb === null ? unavailable : `${d.memoryUsedGb.toFixed(1)} GB`,
      tooltip: "Total memori terpakai lintas node.",
      disabled: (d) => (d.memoryUsedGb === null ? unavailableReason : undefined),
    },
    {
      id: "latency",
      label: "Latensi p95",
      accent: "default",
      icon: <Timer />,
      value: (d) =>
        d.latencyP95Ms === null ? unavailable : `${d.latencyP95Ms} ms`,
      tooltip: "Latensi persentil 95 dari seluruh request.",
      disabled: (d) => (d.latencyP95Ms === null ? unavailableReason : undefined),
    },
    {
      id: "error-rate",
      label: "Error Rate",
      accent: "rose",
      icon: <HeartPulse />,
      value: (d) =>
        d.errorRate === null ? unavailable : `${d.errorRate.toFixed(2)}%`,
      tooltip: "Persentase request yang menghasilkan error.",
      disabled: (d) => (d.errorRate === null ? unavailableReason : undefined),
    },
  ],
}
