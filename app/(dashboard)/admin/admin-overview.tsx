"use client"

import Link from "next/link"
import { Crown, FileText, Settings, Users } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { KpiSection } from "@/components/kpi"
import { useAuth } from "@/lib/auth-context"
import { adminKpis } from "@/lib/kpi/presets/admin"
import {
  MOCK_PROJECTS,
  MOCK_USERS,
  getTotalDeployments,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

import { AlertsPanel } from "./_components/alerts-panel"
import { RecentActivity } from "./_components/recent-activity"
import { RoleDistribution } from "./_components/role-distribution"
import { SystemHealth } from "./_components/system-health"

export function AdminOverview() {
  const { user } = useAuth()
  if (!user) return null

  const totalDeployments = getTotalDeployments(MOCK_PROJECTS)

  const roleCounts = MOCK_USERS.reduce(
    (acc, u) => {
      acc[u.role]++
      return acc
    },
    { ADMIN: 0, USER: 0, VIEWER: 0 } as Record<Role, number>
  )
  const totalUsers = MOCK_USERS.length
  const activeUsers = MOCK_USERS.filter((u) => u.isActive).length

  const kpiData = {
    totalUsers,
    activeUsers,
    totalProjects: MOCK_PROJECTS.length,
    totalDeployments,
    roleCounts,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Crown className="size-6 text-amber-500" aria-hidden="true" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan sistem, user, dan aktivitas terbaru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <FileText className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Audit</span>
          </Link>
          <Link
            href="/admin/settings"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <Settings className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <Link
            href="/admin/users"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Users className="size-3.5" aria-hidden="true" />
            Kelola User
          </Link>
        </div>
      </header>

      {/* ── Z Row 1: KPI ───────────────────────────────────────── */}
      <KpiSection config={adminKpis} data={kpiData} role={user.role} />

      {/* ── Z Diagonal: focal zone ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentActivity className="lg:col-span-2" />
        <RoleDistribution counts={roleCounts} total={totalUsers} />
      </div>

      {/* ── Z Row 2: bottom bar ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SystemHealth className="lg:col-span-2" />
        <AlertsPanel />
      </div>
    </div>
  )
}
