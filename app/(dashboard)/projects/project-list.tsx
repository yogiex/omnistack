"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  Plus,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
  getMockProjectsByUser,
  MOCK_USERS,
  type MockProject,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  ProjectFormSheet,
  EMPTY_PROJECT_FORM,
  type ProjectForm,
} from "./project-form-sheet"
import { ProjectsStats } from "./_components/projects-stats"
import {
  ProjectCard,
  type ManagedProject,
  type ProjectCardHandlers,
} from "./_components/project-card"
import { ProjectsTable } from "./_components/projects-table"
import {
  FilterBar,
  type ProjectView,
  type SortKey,
} from "./_components/filter-bar"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "Semua Proyek",
  USER: "Proyek Saya",
  VIEWER: "Proyek yang Di-share",
}

const DESCRIPTION_BY_ROLE: Record<Role, string> = {
  ADMIN: "Seluruh proyek dari semua user di sistem.",
  USER: "Proyek milik Anda. Proyek user lain tidak tampil di sini.",
  VIEWER: "Proyek yang di-share ke Anda untuk dipantau (read-only).",
}

type StatusFilter =
  | "all"
  | "active"
  | "deploying"
  | "failed"
  | "inactive"
  | "archived"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Live" },
  { value: "deploying", label: "Building" },
  { value: "failed", label: "Failed" },
  { value: "inactive", label: "Stopped" },
  { value: "archived", label: "Archived" },
]

const PAGE_SIZE = 6
const SKELETON_DELAY_MS = 600

export function ProjectList() {
  const { user, isLoading: isAuthLoading } = useAuth()

  const [projects, setProjects] = useState<ManagedProject[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("updated")
  const [view, setView] = useState<ProjectView>("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_PROJECT_FORM)
  const [transferId, setTransferId] = useState<string | null>(null)
  const [transferOwner, setTransferOwner] = useState<string>("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  // Simulasi fetch awal untuk menampilkan skeleton
  useEffect(() => {
    if (!user) return
    const timer = setTimeout(() => {
      setProjects(getMockProjectsByUser(user.id, user.role))
      setIsDataLoading(false)
    }, SKELETON_DELAY_MS)
    return () => clearTimeout(timer)
  }, [user])

  const openCreate = () => {
    setFormMode("create")
    setEditingId(null)
    setForm(EMPTY_PROJECT_FORM)
    setFormSheetOpen(true)
  }

  // Keyboard shortcuts: N = proyek baru, / = fokus pencarian
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement

      if (
        !isTyping &&
        (e.key === "n" || e.key === "N") &&
        user &&
        (user.role === "ADMIN" || user.role === "USER")
      ) {
        e.preventDefault()
        openCreate()
      }
      if (!isTyping && e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const isAdmin = user?.role === "ADMIN"

  const ownerName = (userId: string) =>
    MOCK_USERS.find((u) => u.id === userId)?.name ?? "Unknown"

  const filteredProjects = useMemo(() => {
    let result = projects

    if (statusFilter === "archived") result = result.filter((p) => p.archived)
    else if (statusFilter !== "all")
      result = result.filter(
        (p) => !p.archived && p.status === statusFilter
      )

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (isAdmin && ownerFilter !== "all") {
      result = result.filter((p) => p.userId === ownerFilter)
    }

    switch (sortKey) {
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "created":
        result = [...result].reverse()
        break
      case "updated":
        result = [...result].sort((a, b) => b.deployments - a.deployments)
        break
    }

    return result
  }, [
    projects,
    statusFilter,
    searchQuery,
    ownerFilter,
    sortKey,
    isAdmin,
  ])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const canManageProject = (project: MockProject) =>
    isAdmin || project.userId === user?.id

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const visibleProjects = filteredProjects.slice(startIdx, startIdx + PAGE_SIZE)

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      building: projects.filter((p) => p.status === "deploying").length,
      failed: projects.filter((p) => p.status === "failed").length,
    }),
    [projects]
  )

  const openEdit = (project: ManagedProject) => {
    setFormMode("edit")
    setEditingId(project.id)
    setForm({ name: project.name, description: project.description })
    setFormSheetOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      showNotice("Nama proyek wajib diisi.")
      return
    }
    if (!user) return

    if (formMode === "edit" && editingId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: form.name.trim(), description: form.description.trim() }
            : p
        )
      )
      showNotice(`Proyek ${form.name.trim()} diperbarui.`)
    } else {
      setProjects((prev) => [
        ...prev,
        {
          id: `project-local-${Date.now()}`,
          name: form.name.trim(),
          description: form.description.trim(),
          status: "active",
          userId: user.id,
          createdAtLabel: "Baru saja",
          deployments: 0,
          lastDeployLabel: undefined,
        },
      ])
      showNotice(`Proyek ${form.name.trim()} dibuat dengan status Live.`)
    }

    setFormSheetOpen(false)
    setConfirmDeleteId(null)
  }

  const handleToggleArchive = (target: ManagedProject) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, archived: !p.archived } : p
      )
    )
    showNotice(
      target.archived
        ? `Proyek ${target.name} dikeluarkan dari arsip.`
        : `Proyek ${target.name} diarsipkan.`
    )
  }

  const handleClone = (target: ManagedProject) => {
    const cloneName = `${target.name} (Copy)`
    setProjects((prev) => [
      ...prev,
      {
        ...target,
        id: `${target.id}-copy-${Date.now()}`,
        name: cloneName,
        archived: false,
      },
    ])
    showNotice(`Proyek dikloning menjadi "${cloneName}".`)
  }

  const handleDeployLike = (
    label: string,
    project: ManagedProject,
    nextStatus?: ManagedProject["status"]
  ) => {
    if (nextStatus) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                status: nextStatus,
                progress: nextStatus === "deploying" ? 10 : undefined,
                errorMessage: undefined,
              }
            : p
        )
      )
    }
    showNotice(label)
  }

  const handlers: ProjectCardHandlers = {
    onDeploy: (p) =>
      handleDeployLike(`Deploy ${p.name} dimulai (mock).`, p),
    onPause: (p) =>
      handleDeployLike(`Deployment ${p.name} dijeda.`, p, "inactive"),
    onStart: (p) =>
      handleDeployLike(`${p.name} dijalankan kembali.`, p, "active"),
    onRetry: (p) =>
      handleDeployLike(`Retry deploy ${p.name} antre.`, p, "deploying"),
    onEdit: openEdit,
    onToggleArchive: handleToggleArchive,
    onClone: handleClone,
    onTransfer: (project) => {
      setTransferId(project.id)
      setTransferOwner(project.userId)
    },
    onRequestDelete: (projectId) => setConfirmDeleteId(projectId),
    onCancelDelete: () => setConfirmDeleteId(null),
    onDelete: (target) => {
      setProjects((prev) => prev.filter((p) => p.id !== target.id))
      setConfirmDeleteId(null)
      showNotice(`Proyek ${target.name} dihapus permanen.`)
    },
  }

  const handleTransfer = () => {
    if (!transferId || !transferOwner) return
    const project = projects.find((p) => p.id === transferId)
    setProjects((prev) =>
      prev.map((p) =>
        p.id === transferId ? { ...p, userId: transferOwner } : p
      )
    )
    showNotice(
      `Kepemilikan "${project?.name ?? "proyek"}" dipindahkan ke ${ownerName(
        transferOwner
      )}.`
    )
    setTransferId(null)
    setTransferOwner("")
  }

  const canCreate = isAdmin || user?.role === "USER"
  const isLoading = isAuthLoading || !user || isDataLoading

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <FolderGit2 className="h-7 w-7 text-primary" />
            {user ? TITLE_BY_ROLE[user.role] : "Proyek"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user ? DESCRIPTION_BY_ROLE[user.role] : "Memuat sesi..."}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Proyek
          </Button>
        )}
      </div>

      {/* Notifikasi aksi */}
      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Stats cards (bukan VIEWER) */}
      {isAdmin && !isLoading ? (
        <ProjectsStats {...stats} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* Filter bar + view toggle */}
      {user && (
        <FilterBar
          searchRef={searchRef}
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value)
            setCurrentPage(1)
          }}
          sortValue={sortKey}
          onSortChange={(value) => {
            setSortKey(value)
            setCurrentPage(1)
          }}
          view={view}
          onViewChange={setView}
          showOwnerFilter={Boolean(isAdmin)}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={(value) => {
            setOwnerFilter(value)
            setCurrentPage(1)
          }}
        />
      )}

      {/* Pills status */}
      {user && (
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatusFilter(f.value)
                setCurrentPage(1)
              }}
              className={cn(
                buttonVariants({
                  variant: statusFilter === f.value ? "outline" : "ghost",
                  size: "sm",
                }),
                statusFilter === f.value && "border-primary/50 font-medium"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Konten utama */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      ) : visibleProjects.length === 0 ? (
        <Card>
          <CardContent className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <FolderGit2 className="h-9 w-9 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">
              Belum ada proyek
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {user?.role === "VIEWER"
                ? "Minta admin atau developer meng-share proyek ke akun Anda."
                : "Buat deployment pertama Anda dan mulai membangun aplikasi luar biasa."}
            </p>
            {canCreate && (
              <Button size="lg" className="mt-6" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Proyek Baru
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                manageable={canManageProject(project)}
                canDelete={isAdmin || project.userId === user!.id}
                isAdmin={Boolean(isAdmin)}
                isConfirmingDelete={confirmDeleteId === project.id}
                ownerName={
                  isAdmin ? ownerName(project.userId) : undefined
                }
                handlers={handlers}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            filteredCount={filteredProjects.length}
            startIdx={startIdx}
            endIdx={Math.min(startIdx + PAGE_SIZE, filteredProjects.length)}
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => p - 1)}
            onNext={() => setCurrentPage((p) => p + 1)}
          />
        </>
      ) : (
        <>
          <ProjectsTable
            projects={visibleProjects}
            canManageProject={canManageProject}
            isAdmin={Boolean(isAdmin)}
            confirmDeleteId={confirmDeleteId}
            handlers={handlers}
          />

          {/* Pagination */}
          <Pagination
            filteredCount={filteredProjects.length}
            startIdx={startIdx}
            endIdx={Math.min(startIdx + PAGE_SIZE, filteredProjects.length)}
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => p - 1)}
            onNext={() => setCurrentPage((p) => p + 1)}
          />
        </>
      )}

      {/* Sheet create/edit proyek */}
      <ProjectFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        mode={formMode}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
      />

      {/* Sheet transfer ownership (khusus ADMIN) */}
      <Sheet
        open={transferId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTransferId(null)
            setTransferOwner("")
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Transfer Ownership</SheetTitle>
            <SheetDescription>
              Pilih pemilik baru untuk proyek{" "}
              <span className="font-medium text-foreground">
                {projects.find((p) => p.id === transferId)?.name ?? ""}
              </span>
              .
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-owner">Pemilik Baru</Label>
              <select
                id="transfer-owner"
                value={transferOwner}
                onChange={(e) => setTransferOwner(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
              >
                <option value="" disabled>
                  Pilih user…
                </option>
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Setelah transfer, Anda kehilangan aksi kepemilikan pada proyek ini
              (mock — perubahan hanya tersimpan di sesi ini).
            </p>
          </div>

          <SheetFooter>
            <Button onClick={handleTransfer} disabled={!transferOwner}>
              Transfer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface PaginationProps {
  filteredCount: number
  startIdx: number
  endIdx: number
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

function Pagination({
  filteredCount,
  startIdx,
  endIdx,
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationProps) {
  if (filteredCount === 0) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan {startIdx + 1}–{endIdx} dari {filteredCount} proyek
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
