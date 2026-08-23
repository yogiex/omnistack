"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FolderGit2,
  MoreVertical,
  Pencil,
  Rocket,
  Search,
  Trash2,
  UserRoundPlus,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { ProjectStatusBadge } from "@/components/project-status-badge"
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

const PROJECT_STACKS: Record<string, string> = {
  "proj-001": "Next.js + Stripe",
  "proj-002": "Node.js + OpenAI",
  "proj-003": "Astro + Tailwind",
  "proj-004": "React + Vite",
}

interface ManagedProject extends MockProject {
  archived?: boolean
}

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

type StatusFilter = "all" | "active" | "archived"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
]

const PAGE_SIZE = 6

export function ProjectList() {
  const { user } = useAuth()

  const [projects, setProjects] = useState<ManagedProject[]>(() =>
    user ? getMockProjectsByUser(user.id, user.role) : []
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_PROJECT_FORM)
  const [transferId, setTransferId] = useState<string | null>(null)
  const [transferOwner, setTransferOwner] = useState<string>("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isAdmin = user?.role === "ADMIN"

  const ownerName = (userId: string) =>
    MOCK_USERS.find((u) => u.id === userId)?.name ?? "Unknown"

  const filteredProjects = useMemo(() => {
    let result = projects

    if (statusFilter === "active") result = result.filter((p) => !p.archived)
    else if (statusFilter === "archived") result = result.filter((p) => p.archived)

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

    return result
  }, [projects, statusFilter, searchQuery, ownerFilter, isAdmin])

  if (!user) return null

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const canManage = (project: MockProject) =>
    isAdmin || project.userId === user.id

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const visibleProjects = filteredProjects.slice(startIdx, startIdx + PAGE_SIZE)

  const openCreate = () => {
    setFormMode("create")
    setEditingId(null)
    setForm(EMPTY_PROJECT_FORM)
    setFormSheetOpen(true)
  }

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
        },
      ])
      showNotice(`Proyek ${form.name.trim()} dibuat dengan status Active.`)
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

  const openTransfer = (project: ManagedProject) => {
    setTransferId(project.id)
    setTransferOwner(project.userId)
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

  const handleDelete = (target: ManagedProject) => {
    setProjects((prev) => prev.filter((p) => p.id !== target.id))
    setConfirmDeleteId(null)
    showNotice(`Proyek ${target.name} dihapus permanen.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <FolderGit2 className="h-7 w-7 text-primary" />
            {TITLE_BY_ROLE[user.role]}
          </h1>
          <p className="mt-1 text-muted-foreground">{DESCRIPTION_BY_ROLE[user.role]}</p>
        </div>
        {(isAdmin || user.role === "USER") && (
          <Button onClick={openCreate}>
            <FolderGit2 className="mr-2 h-4 w-4" />
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

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari proyek..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-8"
          />
        </div>

        {isAdmin && (
          <select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="h-8 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
          >
            <option value="all">Semua Pemilik</option>
            {MOCK_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatusFilter(f.value)
                setCurrentPage(1)
              }}
              className={cn(
                buttonVariants({ variant: statusFilter === f.value ? "outline" : "ghost", size: "sm" }),
                statusFilter === f.value && "border-primary/50 font-medium"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Eye className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Belum ada proyek untuk ditampilkan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.role === "VIEWER"
                ? "Minta admin atau developer meng-share proyek ke akun Anda."
                : "Buat proyek baru atau ubah filter status."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => {
              const manageable = canManage(project)
              const canDelete = isAdmin || project.userId === user.id
              const isConfirmingDelete = confirmDeleteId === project.id
              const stack = PROJECT_STACKS[project.id]

              return (
                <Card
                  key={project.id}
                  className={cn("relative flex flex-col", project.archived && "opacity-60")}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProjectStatusBadge status={project.status} />
                      {stack && (
                        <Badge variant="secondary" className="text-xs">
                          {stack}
                        </Badge>
                      )}
                      {project.archived && (
                        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                          <Archive className="h-3 w-3" />
                          Archived
                        </Badge>
                      )}
                    </div>
                    {isAdmin && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Pemilik: {ownerName(project.userId)}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between gap-2 border-t bg-muted/20 py-3 text-xs text-muted-foreground">
                    <span>{project.deployments} deployment</span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/projects/${project.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-8 px-2 text-xs"
                        )}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Link>
                      {(isAdmin || user.role === "USER") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() =>
                            showNotice("Deploy dimulai (mock)")
                          }
                        >
                          <Rocket className="mr-1 h-3 w-3" />
                          Deploy
                        </Button>
                      )}
                      {manageable &&
                        (isConfirmingDelete ? (
                          <span className="flex items-center gap-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(project)}>
                              Ya, Hapus
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                              Batal
                            </Button>
                          </span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-8 w-8 p-0"
                              )}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Aksi untuk {project.name}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onClick={() => openEdit(project)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleArchive(project)}>
                                {project.archived ? (
                                  <>
                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                    Unarchive
                                  </>
                                ) : (
                                  <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleClone(project)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Clone
                              </DropdownMenuItem>
                              {isAdmin && (
                                <DropdownMenuItem onClick={() => openTransfer(project)}>
                                  <UserRoundPlus className="mr-2 h-4 w-4" />
                                  Transfer Ownership
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirmDeleteId(project.id)}
                                disabled={!canDelete}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Permanen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ))}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filteredProjects.length)} dari {filteredProjects.length} proyek
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
