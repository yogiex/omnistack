"use client"

import { useMemo } from "react"

import { KpiSection } from "@/components/kpi"
import { useAuth } from "@/lib/auth-context"
import { finopsKpis } from "@/lib/kpi/presets/finops"
import {
  FINOPS_OVERVIEW,
  MOCK_BUDGET_ALERTS,
  MOCK_COST_BREAKDOWN,
  MOCK_FINOPS_TREND,
  MOCK_OPTIMIZED_PROJECTS,
  MOCK_RECOMMENDATIONS,
  summarizeAlerts,
} from "@/lib/mock-finops"
import { getMockProjectsByUser, type Role } from "@/lib/mock-data"

import { BudgetAlerts } from "./_components/budget-alerts"
import { BudgetSettings } from "./_components/budget-settings"
import { CostBreakdownTable } from "./_components/cost-breakdown-table"
import { CostTrendChart } from "./_components/cost-trend-chart"
import { CriticalAlertBanner } from "./_components/critical-alert-banner"
import { ExportPanel } from "./_components/export-panel"
import { FinOpsHeader } from "./_components/finops-header"
import { InfraBreakdownStrip } from "./_components/infra-breakdown-strip"
import { OptimizationRecommendations } from "./_components/optimization-recommendations"

const LAST_SYNC_LABEL = "1 jam lalu"

export function FinOpsClient() {
  const { user, isLoading } = useAuth()
  const role: Role = user?.role ?? "VIEWER"

  const visibleBreakdown = useMemo(() => {
    if (!user) return []
    const allowedIds = new Set(
      getMockProjectsByUser(user.id, role).map((p) => p.id)
    )
    return MOCK_COST_BREAKDOWN.filter((b) => allowedIds.has(b.projectId))
  }, [user, role])

  /**
   * Alert mengikuti pola RBAC yang sama dengan `visibleBreakdown`.
   * `BudgetAlert.projectId` bersifat opsional: alert tanpa projectId
   * dianggap alert tingkat organisasi, jadi hanya ditampilkan untuk ADMIN
   * (bukan USER/VIEWER) agar tidak membocorkan data lintas proyek.
   */
  const visibleAlerts = useMemo(() => {
    if (!user) return []
    const allowedIds = new Set(
      getMockProjectsByUser(user.id, role).map((p) => p.id)
    )
    return MOCK_BUDGET_ALERTS.filter((a) => {
      if (!a.projectId) return role === "ADMIN"
      return allowedIds.has(a.projectId)
    })
  }, [user, role])

  const alertsSummary = useMemo(
    () => summarizeAlerts(visibleAlerts),
    [visibleAlerts]
  )

  const canManageBudget = role === "ADMIN" || role === "USER"

  const visibleRecommendations = useMemo(
    () =>
      MOCK_RECOMMENDATIONS.filter((r) =>
        visibleBreakdown.some((b) => b.projectId === r.projectId)
      ),
    [visibleBreakdown]
  )

  const kpiData = useMemo(
    () => ({
      overview: FINOPS_OVERVIEW,
      trend: MOCK_FINOPS_TREND,
      role,
      alerts: alertsSummary,
    }),
    [role, alertsSummary]
  )

  if (isLoading) return <FinOpsSkeleton />

  return (
    <div className="space-y-6">
      <FinOpsHeader
        role={role}
        activeAlerts={alertsSummary.total}
        criticalAlerts={alertsSummary.critical}
        lastSyncLabel={LAST_SYNC_LABEL}
      />

      <CriticalAlertBanner alerts={visibleAlerts} />

      <KpiSection config={finopsKpis} data={kpiData} role={role} />

      <InfraBreakdownStrip overview={FINOPS_OVERVIEW} />

      <CostTrendChart data={MOCK_FINOPS_TREND} overview={FINOPS_OVERVIEW} />

      <CostBreakdownTable
        items={visibleBreakdown}
        canManageBudget={canManageBudget}
        showOwner={role === "ADMIN"}
      />

      <OptimizationRecommendations
        recommendations={visibleRecommendations}
        optimized={MOCK_OPTIMIZED_PROJECTS}
        canApply={canManageBudget}
      />

      <div id="budget-alerts" className="scroll-mt-24">
        <BudgetAlerts alerts={visibleAlerts} canDismiss={canManageBudget} />
      </div>

      <ExportPanel collapsible />

      <BudgetSettings isAdmin={role === "ADMIN"} collapsible />
    </div>
  )
}

const KPI_KEYS = ["kpi-1", "kpi-2", "kpi-3", "kpi-4"] as const
const STRIP_KEYS = ["strip-1", "strip-2", "strip-3", "strip-4"] as const

function FinOpsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_KEYS.map((key) => (
          <div key={key} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STRIP_KEYS.map((key) => (
          <div key={key} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
