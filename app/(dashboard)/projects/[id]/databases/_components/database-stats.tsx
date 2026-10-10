"use client"

import { Activity, HardDrive, TrendingUp } from "lucide-react"
import { SiPostgresql, SiRedis } from "react-icons/si"

import { StatCard, StatGrid } from "@/components/stat-card"
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
    <StatGrid cols={4}>
      <StatCard
        title="PostgreSQL Instances"
        value={postgresCount}
        icon={<SiPostgresql />}
      >
        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" aria-hidden="true" />
          +1 minggu ini
        </p>
      </StatCard>

      <StatCard
        title="Redis Instances"
        value={redisDbs.length}
        hint={`Cache hit: rata-rata ${redisCacheAvg.toFixed(0)}%`}
        icon={<SiRedis />}
      />

      <StatCard
        title="Total Storage Used"
        value={formatStorageLabel(totalUsedGb)}
        hint={`dari ${totalLimitGb} GB`}
        icon={<HardDrive />}
      >
        <div
          role="progressbar"
          aria-valuenow={Math.round(storagePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Persentase storage terpakai"
          className="mt-3 h-1.5 rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full",
              storagePercent < 80 ? "bg-primary" : "bg-destructive",
            )}
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </StatCard>

      <StatCard
        title="Queries/jam"
        value={queriesLabel}
        hint="↑ 18%"
        icon={<Activity />}
      />
    </StatGrid>
  )
}