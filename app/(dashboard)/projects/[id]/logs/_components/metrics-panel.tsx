"use client"

import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react"
import type { ReactNode } from "react"

import { StatCard, StatGrid } from "@/components/stat-card"
import { cn } from "@/lib/utils"

interface MetricsPanelProps {
  projectId: string
}

interface Metric {
  name: string
  value: number
  max: number
  unit: string
  icon: ReactNode
  /** Warna bar memakai token chart shadcn, bukan palet mentah. */
  barClass: string
  trendClass: string
  trendLabel: string
}

const METRICS: Metric[] = [
  {
    name: "CPU Usage",
    value: 45,
    max: 100,
    unit: "%",
    icon: <Cpu />,
    barClass: "bg-chart-1",
    trendClass: "text-muted-foreground",
    trendLabel: "→ stable",
  },
  {
    name: "Memory",
    value: 67,
    max: 100,
    unit: "%",
    icon: <MemoryStick />,
    barClass: "bg-chart-2",
    trendClass: "text-destructive",
    trendLabel: "↑ up",
  },
  {
    name: "Disk I/O",
    value: 23,
    max: 100,
    unit: "%",
    icon: <HardDrive />,
    barClass: "bg-chart-3",
    trendClass: "text-emerald-600 dark:text-emerald-400",
    trendLabel: "↓ down",
  },
  {
    name: "Network",
    value: 156,
    max: 200,
    unit: "Mbps",
    icon: <Network />,
    barClass: "bg-chart-4",
    trendClass: "text-destructive",
    trendLabel: "↑ up",
  },
]

function MetricBar({ metric }: { metric: Metric }) {
  const pct = Math.min((metric.value / metric.max) * 100, 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Penggunaan ${metric.name}`}
      className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn("h-full rounded-full transition-all", metric.barClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function MetricsPanel({ projectId }: MetricsPanelProps) {
  return (
    <StatGrid cols={4}>
      {METRICS.map((metric) => (
        <StatCard
          key={metric.name}
          title={metric.name}
          icon={metric.icon}
          value={
            <>
              {metric.value}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {metric.unit}
              </span>
            </>
          }
          hint={
            <span className={cn("text-xs font-medium", metric.trendClass)}>
              {metric.trendLabel}
            </span>
          }
        >
          <MetricBar metric={metric} />
        </StatCard>
      ))}
    </StatGrid>
  )
}
