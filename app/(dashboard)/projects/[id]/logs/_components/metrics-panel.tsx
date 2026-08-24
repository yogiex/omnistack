"use client"

import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
    icon: <Cpu className="h-5 w-5" />,
    barClass: "bg-purple-500",
    trendClass: "text-muted-foreground border-border",
    trendLabel: "→ stable",
  },
  {
    name: "Memory",
    value: 67,
    max: 100,
    unit: "%",
    icon: <MemoryStick className="h-5 w-5" />,
    barClass: "bg-blue-500",
    trendClass: "text-red-500 border-red-500/50",
    trendLabel: "↑ up",
  },
  {
    name: "Disk I/O",
    value: 23,
    max: 100,
    unit: "%",
    icon: <HardDrive className="h-5 w-5" />,
    barClass: "bg-amber-500",
    trendClass: "text-emerald-500 border-emerald-500/50",
    trendLabel: "↓ down",
  },
  {
    name: "Network",
    value: 156,
    max: 200,
    unit: "Mbps",
    icon: <Network className="h-5 w-5" />,
    barClass: "bg-emerald-500",
    trendClass: "text-red-500 border-red-500/50",
    trendLabel: "↑ up",
  },
]

export function MetricsPanel({ projectId }: MetricsPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((metric) => (
        <Card key={metric.name}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2 text-foreground">{metric.icon}</div>
              <Badge variant="outline" className={cn("text-xs", metric.trendClass)}>
                {metric.trendLabel}
              </Badge>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{metric.name}</p>
              <p className="text-2xl font-bold">
                {metric.value}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {metric.unit}
                </span>
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", metric.barClass)}
                style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
