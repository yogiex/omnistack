import {
  Boxes,
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MockDeployment } from "@/lib/mock-data"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  hint: string
  trend?: { value: string; positive: boolean }
}

function StatCard({ icon, label, value, hint, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs text-muted-foreground">{hint}</p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.positive ? "text-green-500" : "text-red-500"
            )}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </Card>
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
    avgDuration > 0 ? `${avgMinutes}m ${avgSeconds}s` : "\u2014"

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      <StatCard
        icon={<Boxes className="h-5 w-5 text-primary" />}
        label="Total"
        value={total}
        hint="7 hari terakhir"
        trend={{ value: "+23", positive: true }}
      />
      <StatCard
        icon={<CircleCheck className="h-5 w-5 text-green-500" />}
        label="Success"
        value={success}
        hint={`${successRate}%`}
        trend={{ value: "+19", positive: true }}
      />
      <StatCard
        icon={
          <LoaderCircle className="h-5 w-5 animate-spin text-yellow-500" />
        }
        label="Active"
        value={active}
        hint="building"
      />
      <StatCard
        icon={<CircleX className="h-5 w-5 text-red-500" />}
        label="Failed"
        value={failed}
        hint={`${failedRate}%`}
        trend={{ value: "+4", positive: false }}
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-blue-500" />}
        label="Avg Duration"
        value={avgDurationLabel}
        hint="vs periode lalu"
      />
    </div>
  )
}
