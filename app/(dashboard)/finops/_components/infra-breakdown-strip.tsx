"use client"

import { Cpu, Database, HardDrive, Network } from "lucide-react"
import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FinOpsOverview } from "@/lib/mock-finops"
import { cn, formatUSD } from "@/lib/utils"

interface InfraBreakdownStripProps {
  overview: FinOpsOverview
}

interface InfraCategory {
  id: string
  label: string
  cost: number
  icon: ReactNode
  accent: string
  meta: string
}

export function InfraBreakdownStrip({ overview }: InfraBreakdownStripProps) {
  const categories: InfraCategory[] = [
    {
      id: "compute",
      label: "Compute",
      cost: overview.computeCost,
      icon: <Cpu className="size-4" />,
      accent: "bg-emerald-500",
      meta: `CPU avg ${overview.cpuAvg}% · peak ${overview.cpuPeak}%`,
    },
    {
      id: "storage",
      label: "Storage",
      cost: overview.storageCost,
      icon: <HardDrive className="size-4" />,
      accent: "bg-amber-500",
      meta: `${overview.storageUsedGb} GB terpakai · +${overview.storageGrowthGb} GB`,
    },
    {
      id: "network",
      label: "Network",
      cost: overview.networkCost,
      icon: <Network className="size-4" />,
      accent: "bg-red-500",
      meta: `${overview.bandwidthGb} GB bandwidth · ${overview.egressGb} GB egress`,
    },
    {
      id: "database",
      label: "Database",
      cost: overview.databaseCost,
      icon: <Database className="size-4" />,
      accent: "bg-blue-500",
      meta: `${overview.dbQueriesM}M queries · ${overview.dbSlowQueries} slow`,
    },
  ]

  const total = categories.reduce((sum, c) => sum + c.cost, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian Biaya per Infrastruktur</CardTitle>
        <CardDescription>
          Distribusi biaya dan metrik pendukung untuk empat kategori utama.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => {
          const share = total === 0 ? 0 : (category.cost / total) * 100
          return (
            <div
              key={category.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  {category.icon}
                  {category.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {share.toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 font-mono text-lg font-semibold tabular-nums">
                {formatUSD(category.cost, 0)}
              </p>
              <div
                role="progressbar"
                aria-label={`Porsi biaya ${category.label}`}
                aria-valuenow={Math.round(share)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn("h-full rounded-full transition-all", category.accent)}
                  style={{ width: `${share}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{category.meta}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
