"use client"

import { useMemo } from "react"
import { Download, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  FINOPS_OVERVIEW,
  MOCK_BUDGET_ALERTS,
  MOCK_COST_BREAKDOWN,
  MOCK_FINOPS_TREND,
  MOCK_OPTIMIZED_PROJECTS,
  MOCK_RECOMMENDATIONS,
  getMockProjectsByUser,
  type Role,
} from "@/lib/mock-data"
import { BudgetAlerts } from "./_components/budget-alerts"
import { BudgetSettings } from "./_components/budget-settings"
import { CostBreakdownTable } from "./_components/cost-breakdown-table"
import { CostTrendChart } from "./_components/cost-trend-chart"
import { ExportPanel } from "./_components/export-panel"
import { FinOpsOverviewCards } from "./_components/finops-overview"
import { OptimizationRecommendations } from "./_components/optimization-recommendations"

const TITLE_BY_ROLE = {
  ADMIN: "FinOps Dashboard — Seluruh Sistem",
  USER: "FinOps Dashboard — Proyek Anda",
  VIEWER: "FinOps Dashboard (Read-Only)",
} as const

export function FinOpsClient() {
  const { user, isLoading } = useAuth()
  const role: Role = user?.role ?? "VIEWER"

  const visibleBreakdown = useMemo(() => {
    if (!user) return []
    const allowedIds = new Set(getMockProjectsByUser(user.id, role).map((p) => p.id))
    return MOCK_COST_BREAKDOWN.filter((b) => allowedIds.has(b.projectId))
  }, [user, role])

  const alertsSummary = useMemo(
    () => ({
      critical: MOCK_BUDGET_ALERTS.filter((a) => a.severity === "critical").length,
      warning: MOCK_BUDGET_ALERTS.filter((a) => a.severity === "warning").length,
    }),
    []
  )

  const canManageBudget = role === "ADMIN" || role === "USER"
  const canApply = canManageBudget

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{TITLE_BY_ROLE[role]}</h1>
          <p className="text-muted-foreground text-sm">
            Track biaya infrastruktur real-time per-aplikasi, per-tim, dan per-klien.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {role === "VIEWER" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Mode read-only — Anda dapat melihat dan mengekspor laporan, namun tidak dapat mengubah anggaran.
        </div>
      )}

      <FinOpsOverviewCards overview={FINOPS_OVERVIEW} alertsSummary={alertsSummary} />

      <CostTrendChart data={MOCK_FINOPS_TREND} />

      <CostBreakdownTable items={visibleBreakdown} canManageBudget={canManageBudget} />

      <OptimizationRecommendations
        recommendations={MOCK_RECOMMENDATIONS.filter((r) =>
          visibleBreakdown.some((b) => b.projectId === r.projectId)
        )}
        optimized={MOCK_OPTIMIZED_PROJECTS}
        canApply={canApply}
      />

      <BudgetAlerts alerts={MOCK_BUDGET_ALERTS} canDismiss={canManageBudget} />

      <ExportPanel />

      <BudgetSettings isAdmin={role === "ADMIN"} />
    </div>
  )
}
