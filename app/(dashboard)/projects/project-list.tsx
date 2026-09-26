"use client"

import { useMemo, useRef, useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { KpiSection } from "@/components/kpi"
import { useAuth } from "@/lib/auth-context"
import { projectsKpis } from "@/lib/kpi/presets/projects"
import type { MockProject } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

import { useNotice } from "./_hooks/use-notice"
import {
  useProjectFilters,
  STATUS_FILTERS,
} from "./_hooks/use-project-filters"
import { useProjectShortcuts } from "./_hooks/use-project-shortcuts"
import { useProjects } from "./_hooks/use-projects"

import { FilterBar } from "./_components/filter-bar"
import {
  ProjectCard,
  type ManagedProject,
  type ProjectCardHandlers,
} from "./_components/project-card"
import { ProjectsEmptyFiltered } from "./_components/projects-empty-filtered"
import { ProjectsEmptyNone } from "./_components/projects-empty-none"
import { ProjectsHeader } from "./_components/projects-header"
import { ProjectsNotice } from "./_components/projects-notice"
import { ProjectsPagination } from "./_components/projects-pagination"
import { ProjectsSkeleton } from "./_components/projects-skeleton"
import { ProjectsTable } from "./_components/projects-table"
import { TransferOwnershipSheet } from "./_components/transfer-ownership-sheet"
import {
  ProjectFormSheet,
  EMPTY_PROJECT_FORM,
  type ProjectForm,
} from "./project-form-sheet"

export function ProjectList() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const canCreate = isAdmin === true || user?.role === "USER"

  const {
    projects,
    isLoading: isProjectsLoading,
    stats,
    ownerName,
    create,
    update,
    remove,
    clone,
    toggleArchive,
    transfer,
    setStatus,
  } = useProjects({ userId: user?.id, role: user?.role })

  const { notice, showNotice, dismiss } = useNotice()

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    ownerFilter,
    setOwnerFilter,
    sortKey,
    setSortKey,
    view,
    setView,
    currentPage,
    setCurrentPage,
    filtered,
    visible,
    totalPages,
    startIdx,
    endIdx,
    reset: resetFilters,
  } = useProjectFilters({ projects, isAdmin: isAdmin === true })

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_PROJECT_FORM)
  const [transferId, setTransferId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement | null>(null)

  const openCreate = () => {
    setFormMode("create")
    setEditingId(null)
    setForm(EMPTY_PROJECT_FORM)
    setFormOpen(true)
  }

  useProjectShortcuts({ canCreate: canCreate === true, onCreate: openCreate, searchRef })

  /* ------------------------------------------------------------------------ */
  /*  Handlers                                                                 */
  /* ------------------------------------------------------------------------ */

  /** Audit C2: role-based check saja tidak cukup — USER punya hak edit,
   *  tapi hanya atas proyek miliknya sendiri. */
  const canManageProject = (project: MockProject) =>
    isAdmin === true || project.userId === user?.id

  const handleFormSubmit = () => {
    if (!form.name.trim()) return showNotice("Nama proyek wajib diisi.")
    if (!user) return

    if (formMode === "edit" && editingId) {
      const target = projects.find((p) => p.id === editingId)
      if (!target || !canManageProject(target)) {
        setFormOpen(false)
        return showNotice("Akses ditolak.")
      }
      update(editingId, {
        name: form.name.trim(),
        description: form.description.trim(),
      })
      showNotice(`Proyek ${form.name.trim()} diperbarui.`)
    } else {
      const p = create({
        name: form.name.trim(),
        description: form.description.trim(),
        userId: user.id,
      })
      showNotice(`Proyek ${p.name} dibuat dengan status Live.`)
    }

    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_PROJECT_FORM)
  }

  const openEdit = (project: ManagedProject) => {
    setFormMode("edit")
    setEditingId(project.id)
    setForm({ name: project.name, description: project.description })
    setFormOpen(true)
  }

  const handleDeployLike = (
    label: string,
    project: ManagedProject,
    nextStatus?: ManagedProject["status"]
  ) => {
    if (!canManageProject(project)) {
      return showNotice("Anda tidak memiliki izin untuk aksi ini.")
    }
    if (nextStatus) setStatus(project.id, nextStatus)
    showNotice(label)
  }

  const handlers: ProjectCardHandlers = {
    onDeploy: (p) => handleDeployLike(`Deploy ${p.name} dimulai (mock).`, p),
    onPause: (p) =>
      handleDeployLike(`Deployment ${p.name} dijeda.`, p, "inactive"),
    onStart: (p) =>
      handleDeployLike(`${p.name} dijalankan kembali.`, p, "active"),
    onRetry: (p) =>
      handleDeployLike(`Retry deploy ${p.name} antre.`, p, "deploying"),
    onEdit: openEdit,
    onToggleArchive: (p) => {
      if (!canManageProject(p)) return showNotice("Akses ditolak.")
      toggleArchive(p.id)
      showNotice(
        p.archived
          ? `"${p.name}" dikeluarkan dari arsip.`
          : `"${p.name}" diarsipkan.`
      )
    },
    onClone: (p) => {
      if (!canManageProject(p)) return showNotice("Akses ditolak.")
      const c = clone(p)
      showNotice(`Proyek dikloning menjadi "${c.name}".`)
    },
    onTransfer: (p) => {
      if (!isAdmin) return showNotice("Hanya admin yang bisa transfer.")
      setTransferId(p.id)
    },
    onRequestDelete: (projectId) => setConfirmDeleteId(projectId),
    onCancelDelete: () => setConfirmDeleteId(null),
    onDelete: (target) => {
      if (!canManageProject(target)) return showNotice("Akses ditolak.")
      remove(target.id)
      setConfirmDeleteId(null)
      showNotice(`Proyek ${target.name} dihapus permanen.`)
    },
  }

  const transferProject = useMemo(
    () => projects.find((p) => p.id === transferId),
    [projects, transferId]
  )

  const handleTransfer = (newOwnerId: string) => {
    if (!transferProject) return
    transfer(transferProject.id, newOwnerId)
    showNotice(
      `Kepemilikan "${transferProject.name}" dipindahkan ke ${ownerName(newOwnerId)}.`
    )
    setTransferId(null)
  }

  /* ------------------------------------------------------------------------ */
  /*  Derived                                                                  */
  /* ------------------------------------------------------------------------ */

  const kpiData = useMemo(
    () => ({
      total: stats.total,
      live: stats.active,
      building: stats.building,
      failed: stats.failed,
    }),
    [stats]
  )

  const isLoading = isAuthLoading || !user || isProjectsLoading

  const pagination = (
    <ProjectsPagination
      totalCount={filtered.length}
      startIdx={startIdx}
      endIdx={endIdx}
      page={currentPage}
      totalPages={totalPages}
      onPrev={() => setCurrentPage((p) => p - 1)}
      onNext={() => setCurrentPage((p) => p + 1)}
    />
  )

  /* ------------------------------------------------------------------------ */
  /*  Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="flex flex-col gap-6">
      {user && (
        <ProjectsHeader
          role={user.role}
          canCreate={canCreate === true}
          onCreate={openCreate}
        />
      )}

      {notice && <ProjectsNotice message={notice} onDismiss={dismiss} />}

      {isLoading ? (
        <ProjectsSkeleton showStats={isAdmin === true} />
      ) : !user ? null : (
        <>
          {isAdmin && (
            <KpiSection config={projectsKpis} data={kpiData} role={user.role} />
          )}

          <FilterBar
            searchRef={searchRef}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortValue={sortKey}
            onSortChange={setSortKey}
            view={view}
            onViewChange={setView}
            showOwnerFilter={isAdmin === true}
            ownerFilter={ownerFilter}
            onOwnerFilterChange={setOwnerFilter}
          />

          <div
            role="group"
            aria-label="Filter status"
            className="flex flex-wrap items-center gap-2"
          >
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  buttonVariants({
                    variant: statusFilter === f.value ? "outline" : "ghost",
                    size: "sm",
                  }),
                  statusFilter === f.value &&
                    "border-primary/50 font-medium"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 && projects.length > 0 ? (
            <ProjectsEmptyFiltered onReset={resetFilters} />
          ) : visible.length === 0 ? (
            <ProjectsEmptyNone
              role={user.role}
              canCreate={canCreate === true}
              onCreate={openCreate}
            />
          ) : view === "grid" ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    manageable={canManageProject(project)}
                    isAdmin={isAdmin === true}
                    isConfirmingDelete={confirmDeleteId === project.id}
                    ownerName={isAdmin ? ownerName(project.userId) : undefined}
                    handlers={handlers}
                  />
                ))}
              </div>
              {pagination}
            </>
          ) : (
            <>
              <ProjectsTable
                projects={visible}
                canManageProject={canManageProject}
                isAdmin={isAdmin === true}
                confirmDeleteId={confirmDeleteId}
                handlers={handlers}
              />
              {pagination}
            </>
          )}
        </>
      )}

      <ProjectFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        form={form}
        onFormChange={setForm}
        onSubmit={handleFormSubmit}
      />

      {isAdmin && transferProject && (
        <TransferOwnershipSheet
          open={transferId !== null}
          onOpenChange={(open) => {
            if (!open) setTransferId(null)
          }}
          projectName={transferProject.name}
          currentOwnerId={transferProject.userId}
          onSubmit={handleTransfer}
        />
      )}
    </main>
  )
}
