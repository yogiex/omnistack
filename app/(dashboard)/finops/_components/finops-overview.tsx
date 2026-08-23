"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  BellRing,
  Coins,
  Cpu,
  Database,
  HardDrive,
  TrendingUp,
} from "lucide-react"
import type { FinOpsOverview } from "@/lib/mock-data"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

interface FinOpsOverviewCardsProps {
  overview: FinOpsOverview
  alertsSummary: { critical: number; warning: number }
}

export function FinOpsOverviewCards({ overview, alertsSummary }: FinOpsOverviewCardsProps) {
  const budgetPct = Math.min(100, (overview.totalCost / overview.budget) * 100)
  const progressColor =
    budgetPct >= 100 ? "bg-red-500" : budgetPct >= 75 ? "bg-amber-500" : "bg-emerald-500"
  const remaining = overview.budget - overview.totalCost

  const computePct = (overview.computeCost / overview.totalCost) * 100
  const storagePct = (overview.storageCost / overview.totalCost) * 100
  const networkPct = (overview.networkCost / overview.totalCost) * 100
  const databasePct = (overview.databaseCost / overview.totalCost) * 100

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" /> Total Biaya Bulan Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="font-mono text-3xl font-bold tabular-nums">
            {formatCurrency(overview.totalCost)}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
            )}
          >
            <TrendingUp className="h-3 w-3" />↑ {overview.trend.toFixed(1)}% vs bulan lalu
          </span>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", progressColor)}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Budget: {formatCurrency(overview.budget)} · Sisa:{" "}
              <span className="font-mono tabular-nums">{formatCurrency(remaining)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <MetricCard
        icon={<Cpu className="h-4 w-4" />}
        title="Compute"
        value={overview.computeCost}
        pctOfTotal={computePct}
        footer={
          <>
            CPU Avg: <span className="font-mono tabular-nums">{overview.cpuAvg}%</span> · Peak:{" "}
            <span className="font-mono tabular-nums">{overview.cpuPeak}%</span>
          </>
        }
      />

      <MetricCard
        icon={<HardDrive className="h-4 w-4" />}
        title="Storage"
        value={overview.storageCost}
        pctOfTotal={storagePct}
        footer={
          <>
            Terpakai: <span className="font-mono tabular-nums">{overview.storageUsedGb} GB</span> ·
            Tumbuh: +<span className="font-mono tabular-nums">{overview.storageGrowthGb} GB</span>
          </>
        }
      />

      <MetricCard
        icon={<TrendingUp className="h-4 w-4" />}
        title="Network"
        value={overview.networkCost}
        pctOfTotal={networkPct}
        footer={
          <>
            Bandwidth:{" "}
            <span className="font-mono tabular-nums">{overview.bandwidthGb} GB</span> · Egress:{" "}
            <span className="font-mono tabular-nums">{overview.egressGb} GB</span>
          </>
        }
      />

      <MetricCard
        icon={<Database className="h-4 w-4" />}
        title="Database"
        value={overview.databaseCost}
        pctOfTotal={databasePct}
        footer={
          <>
            Queries:{" "}
            <span className="font-mono tabular-nums">{overview.dbQueriesM}M</span> · Slow:{" "}
            <span className="font-mono tabular-nums">{overview.dbSlowQueries}</span>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellRing className="h-4 w-4" /> Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-bold font-mono tabular-nums">
            {alertsSummary.critical + alertsSummary.warning}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-mono tabular-nums">{alertsSummary.critical}</span> critical
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="font-mono tabular-nums">{alertsSummary.warning}</span> warning
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Perlu tindakan</p>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: number
  pctOfTotal: number
  footer: React.ReactNode
}

function MetricCard({ icon, title, value, pctOfTotal, footer }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-semibold tabular-nums">
            {formatCurrency(value)}
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{pctOfTotal.toFixed(1)}%</span> of total
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
  )
}
