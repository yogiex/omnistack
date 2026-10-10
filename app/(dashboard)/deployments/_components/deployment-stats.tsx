import {
  Boxes,
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { ReactNode } from "react"

import { StatCard, StatGrid } from "@/components/stat-card"
import { cn } from "@/lib/utils"
import type { MockDeployment } from "@/lib/mock-data"

interface Trend {
  value: string
  positive: boolean
}

function TrendBadge({ trend }: { trend: Trend }) {
  const Icon = trend.positive ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        trend.positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-destructive"
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {trend.value}
    </span>
  )
}

function DeploymentStat({
  icon,
  label,
  value,
  hint,
  trend,
  valueClassName,
}: {
  icon: ReactNode
  label: string
  value: string | number
  hint: string
  trend?: Trend
  valueClassName?: string
}) {
  return (
    <StatCard
      title={label}
      value={value}
      hint={hint}
      icon={icon}
      valueClassName={valueClassName}
    >
      {trend && (
        <p className="mt-1">
          <TrendBadge trend={trend} />
        </p>
      )}
    </StatCard>
  )
}

interface DeploymentStatsProps {
  deployments: MockDeployment[]
}

export function DeploymentStats({ deployments }: DeploymentStatsProps) {
  const total = deployments.length
  const success = deployments.filter((d) => d.status === "success").length
  const active = deployments.filter(
    (d) => d.status === "building" || d.status === "queued"
  ).length
  const failed = deployments.filter((d) => d.status === "failed").length

  const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : "0"
  const failedRate = total > 0 ? ((failed / total) * 100).toFixed(1) : "0"

  // Calculate average duration from completed deployments
  const completedDeployments = deployments.filter(
    (d) => d.durationSeconds && (d.status === "success" || d.status === "failed")
  )
  const avgDuration =
    completedDeployments.length > 0
      ? Math.round(
          completedDeployments.reduce((sum, d) => sum + (d.durationSeconds || 0), 0) /
            completedDeployments.length
        )
      : 0
  const avgMinutes = Math.floor(avgDuration / 60)
  const avgSeconds = avgDuration % 60
  const avgDurationLabel =
    avgDuration > 0 ? `${avgMinutes}m ${avgSeconds}s` : "—"

  return (
    <StatGrid cols={4} className="lg:grid-cols-5">
      <DeploymentStat
        icon={<Boxes />}
        label="Total"
        value={total}
        hint="7 hari terakhir"
        trend={{ value: "+23", positive: true }}
      />
      <DeploymentStat
        icon={<CircleCheck />}
        label="Success"
        value={success}
        hint={`${successRate}%`}
        trend={{ value: "+19", positive: true }}
      />
      <DeploymentStat
        icon={<LoaderCircle className="animate-spin" />}
        label="Active"
        value={active}
        hint="building"
      />
      <DeploymentStat
        icon={<CircleX />}
        label="Failed"
        value={failed}
        hint={`${failedRate}%`}
        valueClassName={failed > 0 ? "text-destructive" : undefined}
        trend={{ value: "+4", positive: false }}
      />
      <DeploymentStat
        icon={<Clock />}
        label="Avg Duration"
        value={avgDurationLabel}
        hint="vs periode lalu"
      />
    </StatGrid>
  )
}