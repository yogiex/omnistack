"use client"

import { useCallback } from "react"

import { KpiSection } from "@/components/kpi"
import { useNotice } from "@/hooks/use-notice"
import { useAuth } from "@/lib/auth-context"
import {
  getProjectName,
  type DeploymentEnvironment,
} from "@/lib/deployment-utils"
import { deploymentsKpis } from "@/lib/kpi/presets/deployments"

import { useDeploymentFilters } from "./_hooks/use-deployment-filters"
import { useDeploymentModals } from "./_hooks/use-deployment-modals"
import { useDeployments } from "./_hooks/use-deployments"
import { ActiveDeployments } from "./_components/active-deployments"
import { AIDiagnoseDialog } from "./_components/ai-diagnose-dialog"
import { DeploymentDetailModal } from "./_components/deployment-detail-modal"
import { DeploymentsEmptyState } from "./_components/deployments-empty-state"
import { DeploymentsFilterBar } from "./_components/deployments-filter-bar"
import { DeploymentsHeader } from "./_components/deployments-header"
import { DeploymentsPagination } from "./_components/deployments-pagination"
import { DeploymentsSkeleton } from "./_components/deployments-skeleton"
import { DeploymentsTable } from "./_components/deployments-table"
import { DeploymentStats } from "./_components/deployment-stats"
import { NewDeploymentDialog } from "./_components/new-deployment-dialog"
import { RollbackDialog } from "./_components/rollback-dialog"

export function DeploymentsList() {
  const { user, isLoading } = useAuth()
  const { notice, showNotice } = useNotice()

  const {
    deployments,
    projects,
    canWrite,
    activeDeployments,
    rollback,
    retry,
    cancel,
    createDeployment,
  } = useDeployments({ userId: user?.id, role: user?.role })

  const filters = useDeploymentFilters({ deployments, projects })
  const modals = useDeploymentModals(deployments)

  /**
   * `useCallback` — yang perlu stabil adalah *fungsinya*, supaya
   * `DeploymentsTable` dan `ActiveDeployments` yang menerimanya sebagai prop
   * tidak melihat fungsi baru setiap render.
   */
  const projectNameOf = useCallback(
    (projectId: string) => getProjectName(projectId, projects),
    [projects],
  )

  const isViewer = user?.role === "VIEWER"

  /* ------------------------------------------------------------------ */
  /*  Handlers — semua hasil mutasi dicek; guard-nya ada di hook          */
  /* ------------------------------------------------------------------ */

  const handleConfirmRollback = (reason: string) => {
    if (modals.state.type !== "rollback") return
    if (!rollback(modals.state.deploymentId, reason)) {
      showNotice("Rollback gagal: akses ditolak atau deployment tidak ada.")
      return
    }
    showNotice("Rollback berhasil.")
    modals.close()
  }

  const handleRetry = (deploymentId: string) => {
    const result = retry(deploymentId)
    if (!result) {
      showNotice("Retry gagal: akses ditolak atau deployment tidak ada.")
      return
    }
    showNotice(`Retry dimulai untuk ${projectNameOf(result.projectId)}.`)
  }

  const handleCancel = (deploymentId: string) => {
    if (!cancel(deploymentId)) {
      showNotice("Pembatalan gagal: akses ditolak atau deployment tidak ada.")
      return
    }
    showNotice("Deployment dibatalkan.")
  }

  const handleNewDeployment = (config: {
    projectId: string
    branch: string
    environment: string
  }) => {
    const result = createDeployment({
      projectId: config.projectId,
      branch: config.branch,
      // `NewDeploymentDialog` mengirim `string`; kenarai di sini yang
      // memvalidasi, supaya dialog tidak perlu tahu union-nya.
      environment: config.environment as DeploymentEnvironment,
    })
    if (!result) {
      showNotice("Deployment gagal dimulai: akses ditolak atau proyek tidak valid.")
      return
    }
    showNotice(
      `Deployment dimulai untuk ${projectNameOf(result.projectId)}.`,
    )
    modals.close()
  }

  /* ------------------------------------------------------------------ */
  /*  Guard                                                               */
  /* ------------------------------------------------------------------ */

  if (isLoading || !user) return <DeploymentsSkeleton />

  return (
    <main className="flex flex-col gap-6">
      <DeploymentsHeader
        role={user.role}
        totalCount={deployments.length}
        projectCount={projects.length}
      />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </div>
      )}

      <KpiSection
        config={deploymentsKpis}
        data={{ deployments, totalInSystem: deployments.length }}
        role={user.role}
      />

      <DeploymentStats deployments={deployments} />

      <DeploymentsFilterBar
        searchQuery={filters.search}
        onSearchChange={filters.setSearch}
        projectFilter={filters.projectFilter}
        onProjectFilterChange={filters.setProjectFilter}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
        environmentFilter={filters.environmentFilter}
        onEnvironmentFilterChange={filters.setEnvironmentFilter}
        dateSort={filters.dateSort}
        onDateSortChange={filters.setDateSort}
        view={filters.view}
        onViewChange={filters.setView}
        projects={projects}
        onReset={filters.reset}
        isViewer={isViewer}
        onCreateNew={modals.openNew}
      />

      <ActiveDeployments
        deployments={activeDeployments}
        isViewer={isViewer}
        onCancel={handleCancel}
        getProjectName={projectNameOf}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Riwayat Deployment
        </h2>

        {filters.filtered.length === 0 ? (
          <DeploymentsEmptyState
            hasFilters={filters.hasFilters}
            onClearFilters={filters.reset}
            onCreate={modals.openNew}
            canCreate={canWrite}
          />
        ) : (
          <>
            <DeploymentsTable
              deployments={filters.paged}
              isViewer={isViewer}
              getProjectName={projectNameOf}
              onViewLogs={modals.openDetail}
              onViewDetail={modals.openDetail}
              onRollback={modals.openRollback}
              onRetry={handleRetry}
              onAIDiagnose={modals.openAIDiagnose}
            />
            <DeploymentsPagination
              totalCount={filters.filtered.length}
              rangeStart={filters.rangeStart}
              rangeEnd={filters.rangeEnd}
              page={filters.page}
              totalPages={filters.totalPages}
              onPrev={() => filters.setPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                filters.setPage((p) => Math.min(filters.totalPages, p + 1))
              }
            />
          </>
        )}
      </section>

      <DeploymentDetailModal
        deployment={modals.target ?? null}
        open={modals.state.type === "detail"}
        onOpenChange={(open) => !open && modals.close()}
        getProjectName={projectNameOf}
      />

      <RollbackDialog
        open={modals.state.type === "rollback"}
        onOpenChange={(open) => !open && modals.close()}
        deploymentId={modals.target?.id ?? ""}
        projectName={
          modals.target ? projectNameOf(modals.target.projectId) : ""
        }
        onConfirm={handleConfirmRollback}
      />

      <AIDiagnoseDialog
        open={modals.state.type === "ai-diagnose"}
        onOpenChange={(open) => !open && modals.close()}
        deploymentId={modals.target?.id ?? ""}
        errorMessage={
          modals.target?.logLines.find((l) => l.includes("✗")) ?? "Build failed"
        }
      />

      <NewDeploymentDialog
        open={modals.state.type === "new"}
        onOpenChange={(open) => !open && modals.close()}
        projects={projects}
        onDeploy={handleNewDeployment}
      />
    </main>
  )
}
