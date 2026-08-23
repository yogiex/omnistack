"use client"

import { Activity, HardDrive, TrendingUp } from "lucide-react"
import { SiPostgresql, SiRedis } from "react-icons/si"

import { Card } from "@/components/ui/card"
import type { MockDatabase } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function formatStorageLabel(gb: number): string {
  if (gb < 1) return `${Math.round(gb * 1000)} MB`
  return `${gb.toFixed(1)} GB`
}

export function DatabaseStats({ databases }: { databases: MockDatabase[] }) {
  const postgresCount = databases.filter((d) => d.engine === "POSTGRES").length
  const redisDbs = databases.filter((d) => d.engine === "REDIS")
  const redisCacheAvg =
    redisDbs.length > 0
      ? redisDbs.reduce((acc, d) => acc + (d.metrics.cacheHitRatio ?? 90), 0) /
        redisDbs.length
      : 0

  const totalUsedGb = databases.reduce(
    (acc, d) => acc + d.resources.storageUsedGb,
    0,
  )
  const totalLimitGb = databases.reduce(
    (acc, d) => acc + d.resources.storageLimitGb,
    0,
  )
  const storagePercent =
    totalLimitGb > 0 ? (totalUsedGb / totalLimitGb) * 100 : 0

  const totalQueriesPerHour = Math.round(
    databases.reduce((acc, d) => acc + d.metrics.queriesPerSecond, 0) * 11,
  )
  const queriesLabel =
    totalQueriesPerHour >= 1000
      ? `${(totalQueriesPerHour / 1000).toFixed(1)}k`
      : String(totalQueriesPerHour)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-6 rounded-xl border bg-card">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ backgroundColor: "#3367911a", color: "#336791" }}
          >
            <SiPostgresql />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            PostgreSQL Instances
          </p>
        </div>
        <p className="mt-4 text-3xl font-bold">{postgresCount}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />+1 minggu ini
        </p>
      </Card>

      <Card className="p-6 rounded-xl border bg-card">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ backgroundColor: "#DC382D1a", color: "#DC382D" }}
          >
            <SiRedis />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Redis Instances
          </p>
        </div>
        <p className="mt-4 text-3xl font-bold">{redisDbs.length}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Cache hit: rata-rata {redisCacheAvg.toFixed(0)}%
        </p>
      </Card>

      <Card className="p-6 rounded-xl border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HardDrive className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Storage Used
          </p>
        </div>
        <p className="mt-4 text-3xl font-bold">
          {formatStorageLabel(totalUsedGb)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          dari {totalLimitGb} GB
        </p>
        <div className="mt-3 h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              storagePercent < 80 ? "bg-primary" : "bg-red-500",
            )}
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </Card>

      <Card className="p-6 rounded-xl border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Queries/jam
          </p>
        </div>
        <p className="mt-4 text-3xl font-bold tabular-nums">{queriesLabel}</p>
        <p className="mt-2 text-xs text-green-600">↑ 18%</p>
      </Card>
    </div>
  )
}
