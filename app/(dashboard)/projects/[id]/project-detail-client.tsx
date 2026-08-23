"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  FolderGit2,
  LayoutList,
  Rocket,
  Settings2,
  Trash2,
  User,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import {
  MOCK_PROJECTS,
  MOCK_DEPLOYMENTS,
  MOCK_USERS,
  type ProjectStatus,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ProjectDetailClientProps {
  projectId: string
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deploying", label: "Deploying" },
]

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const project = MOCK_PROJECTS.find((p) => p.id === projectId)
  const deployments = MOCK_DEPLOYMENTS.filter((d) => d.projectId === projectId)
  const owner = project
    ? MOCK_USERS.find((u) => u.id === project.userId)
    : undefined

  const [name, setName] = useState(project?.name ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "active"
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/projects"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit gap-2"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Proyek
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderGit2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Proyek tidak ditemukan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ID proyek &quot;{projectId}&quot; tidak valid atau sudah dihapus.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const handleSaveSettings = () => {
    showNotice("Pengaturan proyek diperbarui (mock).")
  }

  const handleDelete = () => {
    showNotice(`Proyek ${project.name} dihapus permanen (mock).`)
    setConfirmDelete(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-2 w-fit gap-2"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <FolderGit2 className="h-7 w-7 text-primary" />
            {project.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {project.description}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Notifikasi */}
      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Info ringkas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <ProjectStatusBadge status={project.status} />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {project.status === "active"
                ? "Proyek aktif dan berjalan"
                : project.status === "deploying"
                  ? "Sedang dalam proses deployment"
                  : "Proyek tidak aktif"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemilik</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{owner?.name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {owner?.email ?? ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dibuat</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{project.createdAtLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deploy</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.deployments}</p>
            <p className="text-xs text-muted-foreground">deployment</p>
          </CardContent>
        </Card>
      </div>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutList className="h-5 w-5" />
            Riwayat Deployment ({deployments.length})
          </CardTitle>
          <CardDescription>Daftar deployment terbaru proyek ini</CardDescription>
        </CardHeader>
        <CardContent>
          {deployments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada deployment untuk proyek ini.
            </p>
          ) : (
            <div className="divide-y">
              {deployments.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{dep.branch}</span>{" "}
                      <span className="text-muted-foreground">
                        — {dep.commitMessage}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dep.triggeredBy} · {dep.timeLabel}
                      {dep.durationLabel ? ` · ${dep.durationLabel}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      dep.status === "success" &&
                        "text-green-500 border-green-500/40 bg-green-500/10",
                      dep.status === "building" &&
                        "text-yellow-500 border-yellow-500/40 bg-yellow-500/10",
                      dep.status === "failed" &&
                        "text-red-500 border-red-500/40 bg-red-500/10",
                      dep.status === "queued" &&
                        "text-muted-foreground"
                    )}
                  >
                    {dep.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Pengaturan Proyek
          </CardTitle>
          <CardDescription>Ubah nama, deskripsi, dan status proyek</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nama Proyek</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Deskripsi</Label>
            <Input
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    buttonVariants({
                      variant: status === opt.value ? "outline" : "ghost",
                      size: "sm",
                    }),
                    status === opt.value && "border-primary/50 font-medium"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveSettings}>Simpan Perubahan</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Hapus proyek ini secara permanen. Tindakan ini tidak dapat dibatalkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={handleDelete}>
                Ya, Hapus Permanen
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Batal
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Proyek
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
