"use client"

import { useEffect, useMemo, useState } from "react"
import { Rocket } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getMockDeploymentsForRole,
  getMockProjectsByUser,
  MOCK_PROJECTS,
  type MockDeployment,
  type Role,
} from "@/lib/mock-data"
import { DeploymentStats } from "./_components/deployment-stats"
import { ActiveDeployments } from "./_components/active-deployments"
import { DeploymentsFilterBar, type DeployView } from "./_components/deployments-filter-bar"
import { DeploymentsTable } from "./_components/deployments-table"
import { DeploymentDetailModal } from "./_components/deployment-detail-modal"
import { RollbackDialog } from "./_components/rollback-dialog"
import { AIDiagnoseDialog } from "./_components/ai-diagnose-dialog"
import { NewDeploymentDialog } from "./_components/new-deployment-dialog"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "All Deployments",
  USER: "My Deployments",
  VIEWER: "Shared Deployments",
}

const TIME_UNIT_SECONDS: Record<string, number> = {
  detik: 1,
  menit: 60,
  jam: 3600,
  hari: 86400,
  minggu: 604800,
  bulan: 2592000,
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
}

function getTimeLabelSecondsAgo(label: string): number {
  const normalized = label.trim().toLowerCase()
  if (normalized === "baru saja" || normalized === "just now") return 0
  if (normalized.includes("kemarin") || normalized.includes("yesterday"))
    return TIME_UNIT_SECONDS.hari
  const match = normalized.match(
    /(\d+)\s*(detik|menit|jam|hari|minggu|bulan|seconds?|minutes?|hours?|days?)/
  )
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1]) * (TIME_UNIT_SECONDS[match[2]] ?? 1)
}

function getEffectiveStatus(d: MockDeployment): string {
  if (d.status === "success" && d.logLines.some((l) => l.includes("Rollback")))
    return "rolled_back"
  return d.status
}

export function DeploymentsList() {
  const { user } = useAuth()
  const [deployments, setDeployments] = useState<MockDeployment[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [environmentFilter, setEnvironmentFilter] = useState("all")
  const [dateSort, setDateSort] = useState("newest")
  const [view, setView] = useState<DeployView>("list")

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailDeploymentId, setDetailDeploymentId] = useState<string | null>(null)
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [rollbackDeploymentId, setRollbackDeploymentId] = useState<string | null>(null)
  const [aiDiagnoseOpen, setAiDiagnoseOpen] = useState(false)
  const [aiDiagnoseDeploymentId, setAiDiagnoseDeploymentId] = useState<string | null>(null)
  const [newDeploymentOpen, setNewDeploymentOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const loadData = async () => {
      await Promise.resolve() // simulate async
      if (!cancelled) {
        setDeployments(getMockDeploymentsForRole(user.id, user.role))
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [user])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const projectNameOf = (projectId: string) =>
    MOCK_PROJECTS.find((p) => p.id === projectId)?.name ?? projectId

  const projects = useMemo(
    () => (user ? getMockProjectsByUser(user.id, user.role) : []),
    [user]
  )

  const filteredDeployments = useMemo(() => {
    let result = deployments

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          projectNameOf(d.projectId).toLowerCase().includes(q) ||
          d.branch.toLowerCase().includes(q) ||
          d.commitMessage.toLowerCase().includes(q) ||
          d.triggeredBy.toLowerCase().includes(q)
      )
    }

    if (projectFilter !== "all") {
      result = result.filter((d) => d.projectId === projectFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => getEffectiveStatus(d) === statusFilter)
    }

    if (environmentFilter !== "all") {
      result = result.filter((d) => d.environment === environmentFilter)
    }

    result = [...result].sort((a, b) => {
      const timeA = getTimeLabelSecondsAgo(a.timeLabel)
      const timeB = getTimeLabelSecondsAgo(b.timeLabel)
      return dateSort === "newest" ? timeA - timeB : timeB - timeA
    })

    return result
  }, [deployments, searchQuery, projectFilter, statusFilter, environmentFilter, dateSort])

  const resetFilters = () => {
    setSearchQuery("")
    setProjectFilter("all")
    setStatusFilter("all")
    setEnvironmentFilter("all")
    setDateSort("newest")
  }

  if (!user) return null

  const isViewer = user.role === "VIEWER"

  const handleRollback = (deploymentId: string) => {
    setRollbackDeploymentId(deploymentId)
    setRollbackDialogOpen(true)
  }

  const handleConfirmRollback = (reason: string) => {
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === rollbackDeploymentId
          ? {
              ...d,
              status: "success" as const,
              logLines: [
                ...d.logLines,
                `✓ Rollback successful${reason ? ` (${reason})` : ""}`,
              ],
            }
          : d
      )
    )
    showNotice("Rollback completed successfully.")
  }

  const handleRetry = (deploymentId: string) => {
    const deployment = deployments.find((d) => d.id === deploymentId)
    if (!deployment) return
    const retry: MockDeployment = {
      ...deployment,
      id: `deploy-retry-${Date.now()}`,
      status: "building",
      timeLabel: "just now",
      pipeline: deployment.pipeline.map((s, i) =>
        i === 0
          ? { ...s, status: "running" as const, durationSeconds: undefined }
          : { ...s, status: "pending" as const, durationSeconds: undefined }
      ),
    }
    setDeployments((prev) => [retry, ...prev])
    showNotice(`Retry started for ${projectNameOf(deployment.projectId)}.`)
  }

  const handleCancel = (deploymentId: string) => {
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === deploymentId
          ? { ...d, status: "failed" as const, logLines: [...d.logLines, "✗ Cancelled by user"] }
          : d
      )
    )
    showNotice("Deployment cancelled.")
  }

  const handleViewLogs = (deploymentId: string) => {
    setDetailDeploymentId(deploymentId)
    setDetailModalOpen(true)
  }

  const handleViewDetail = (deploymentId: string) => {
    setDetailDeploymentId(deploymentId)
    setDetailModalOpen(true)
  }

  const handleAIDiagnose = (deploymentId: string) => {
    setAiDiagnoseDeploymentId(deploymentId)
    setAiDiagnoseOpen(true)
  }

  const handleNewDeployment = (config: {
    projectId: string
    branch: string
    environment: string
  }) => {
    const newDeploy: MockDeployment = {
      id: `deploy-${Date.now()}`,
      projectId: config.projectId,
      branch: config.branch,
      commitMessage: "New deployment triggered from dashboard",
      status: "building",
      triggeredBy: user.email,
      timeLabel: "just now",
      commitSha: Date.now().toString(16),
      environment: config.environment as "production" | "staging" | "preview",
      authorEmail: user.email,
      trigger: "manual",
      startedAt: new Date().toISOString(),
      durationSeconds: undefined,
      pipeline: [
        { name: "Clone repository", status: "running", logs: ["Cloning..."] },
        { name: "Install dependencies", status: "pending", logs: [] },
        { name: "Run tests", status: "pending", logs: [] },
        { name: "Build image", status: "pending", logs: [] },
        { name: "Deploy", status: "pending", logs: [] },
      ],
      logLines: ["$ omnistack deploy", "→ Starting deployment..."],
    }
    setDeployments((prev) => [newDeploy, ...prev])
    showNotice(`Deployment started for ${projectNameOf(config.projectId)}.`)
  }

  const detailDeployment = deployments.find((d) => d.id === detailDeploymentId)
  const rollbackDeployment = deployments.find((d) => d.id === rollbackDeploymentId)
  const aiDiagnoseDeployment = deployments.find((d) => d.id === aiDiagnoseDeploymentId)

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Rocket className="h-7 w-7 text-primary" />
          {user ? TITLE_BY_ROLE[user.role] : "Deployments"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isViewer
            ? "Shared project deployments (read-only)."
            : `${deployments.length} deployments across ${projects.length} projects.`}
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <div role="status" aria-live="polite" className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Stats */}
      <DeploymentStats deployments={deployments} />

      {/* Filters */}
      <DeploymentsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(v) => setSearchQuery(v)}
        projectFilter={projectFilter}
        onProjectFilterChange={(v) => setProjectFilter(v)}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => setStatusFilter(v)}
        environmentFilter={environmentFilter}
        onEnvironmentFilterChange={(v) => setEnvironmentFilter(v)}
        dateSort={dateSort}
        onDateSortChange={(v) => setDateSort(v)}
        view={view}
        onViewChange={setView}
        projects={projects}
        onReset={resetFilters}
        isViewer={isViewer}
        onCreateNew={() => setNewDeploymentOpen(true)}
      />

      {/* Active Deployments */}
      <ActiveDeployments
        deployments={deployments}
        isViewer={isViewer}
        onCancel={handleCancel}
        getProjectName={projectNameOf}
      />

      {/* History Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Deployment History</h2>
        {filteredDeployments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No deployments match your filters.
            </p>
          </div>
        ) : (
          <DeploymentsTable
            deployments={filteredDeployments}
            isViewer={isViewer}
            getProjectName={projectNameOf}
            onViewLogs={handleViewLogs}
            onViewDetail={handleViewDetail}
            onRollback={handleRollback}
            onRetry={handleRetry}
            onAIDiagnose={handleAIDiagnose}
          />
        )}
      </div>

      {/* Modals */}
      <DeploymentDetailModal
        deployment={detailDeployment ?? null}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        getProjectName={projectNameOf}
      />

      <RollbackDialog
        open={rollbackDialogOpen}
        onOpenChange={setRollbackDialogOpen}
        deploymentId={rollbackDeploymentId ?? ""}
        projectName={rollbackDeployment ? projectNameOf(rollbackDeployment.projectId) : ""}
        onConfirm={handleConfirmRollback}
      />

      <AIDiagnoseDialog
        open={aiDiagnoseOpen}
        onOpenChange={setAiDiagnoseOpen}
        deploymentId={aiDiagnoseDeploymentId ?? ""}
        errorMessage={
          aiDiagnoseDeployment?.logLines.find((l) => l.includes("✗")) ??
          "Build failed"
        }
      />

      <NewDeploymentDialog
        open={newDeploymentOpen}
        onOpenChange={setNewDeploymentOpen}
        projects={projects}
        onDeploy={handleNewDeployment}
      />
    </main>
  )
}