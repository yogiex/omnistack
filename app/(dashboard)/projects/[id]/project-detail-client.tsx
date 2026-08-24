"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  ArrowUpDown,
  Cpu,
  Calendar,
  Code2,
  Database,
  DollarSign,
  ExternalLink,
  FolderGit2,
  LayoutList,
  MemoryStick,
  Rocket,
  ScrollText,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { useAuth } from "@/lib/auth-context"
import {
  MOCK_PROJECTS,
  MOCK_DEPLOYMENTS,
  MOCK_USERS,
  getMockDeploymentsForRole,
  roleAtLeast,
  type ProjectStatus,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ProjectDetailClientProps {
  projectId: string
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Live" },
  { value: "inactive", label: "Stopped" },
  { value: "deploying", label: "Building" },
  { value: "failed", label: "Failed" },
]

interface Metric {
  title: string
  value: string
  note: string
  icon: typeof Cpu
  data: number[]
}

const METRICS: Metric[] = [
  {
    title: "CPU Usage",
    value: "12%",
    note: "rata-rata 1 jam terakhir",
    icon: Cpu,
    data: [8, 14, 11, 18, 12, 9, 13, 16, 20, 15, 10, 12],
  },
  {
    title: "Memory",
    value: "256 MB",
    note: "dari limit 512 MB",
    icon: MemoryStick,
    data: [180, 190, 210, 200, 230, 240, 220, 250, 245, 235, 248, 256],
  },
  {
    title: "Requests",
    value: "1.2k",
    note: "+8% vs minggu lalu",
    icon: Activity,
    data: [40, 55, 48, 70, 82, 76, 95, 110, 98, 120, 115, 128],
  },
  {
    title: "Bandwidth",
    value: "450 MB",
    note: "total bulan ini",
    icon: ArrowUpDown,
    data: [30, 42, 38, 50, 45, 62, 58, 71, 66, 80, 74, 88],
  },
]

const FINOPS_BREAKDOWN = [
  { label: "Compute (container)", amount: 18 },
  { label: "Bandwidth egress", amount: 6.5 },
  { label: "Storage persisten", amount: 4 },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function shortHash(id: string): string {
  return id.slice(-3).toUpperCase()
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
      {data.map((point, index) => (
        <div
          key={index}
          className="w-full rounded-sm bg-primary/60 transition-all last:bg-primary"
          style={{ height: `${Math.max((point / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  )
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { user } = useAuth()
  const project = MOCK_PROJECTS.find((p) => p.id === projectId)

  const visibleDeployments = user
    ? getMockDeploymentsForRole(user.id, user.role).filter(
        (d) => d.projectId === projectId
      )
    : MOCK_DEPLOYMENTS.filter((d) => d.projectId === projectId)

  const owner = project
    ? MOCK_USERS.find((u) => u.id === project.userId)
    : undefined

  const canWrite = !!user && roleAtLeast(user.role, "USER")

  const [name, setName] = useState(project?.name ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "active"
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [selectedLogId, setSelectedLogId] = useState("")

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

  const handleRollback = (depId: string) => {
    showNotice(`Rollback ke deployment #${shortHash(depId)} dimulai (mock).`)
  }

  const handleRetry = (depId: string) => {
    showNotice(`Retry deployment #${shortHash(depId)} diantrekan (mock).`)
  }

  const productionUrl =
    project.url ?? `https://${slugify(project.name)}.omni.dev`
  const previewUrl = `https://preview--${slugify(project.name)}.omni.dev`

  const activeDeployment =
    visibleDeployments.find((d) => d.id === selectedLogId) ??
    visibleDeployments[0]

  const monthlyCost = 12 + project.deployments * 2.5
  const budgetLimit = 50
  const budgetPercent = Math.min((monthlyCost / budgetLimit) * 100, 100)
  const overBudget = monthlyCost > budgetLimit

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
        <div className="flex flex-col items-end gap-2">
          <ProjectStatusBadge status={project.status} />
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}/logs`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <ScrollText className="h-4 w-4" />
              Logs
            </Link>
            <Link
              href={`/projects/${projectId}/ide`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
            >
              <Code2 className="h-4 w-4" />
              Open IDE
            </Link>
          </div>
        </div>
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
            <div className="flex flex-col items-end gap-2">
              <ProjectStatusBadge status={project.status} />
              <Link
                href={`/projects/${projectId}/databases`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
              >
                <Database className="h-4 w-4" />
                Databases
              </Link>
            </div>
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

      {/* Tabs utama */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="finops">FinOps</TabsTrigger>
        </TabsList>

        {/* ==================== TAB OVERVIEW ==================== */}
        <TabsContent value="overview" className="mt-4 flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {metric.note}
                  </p>
                  <Sparkline data={metric.data} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Domains &amp; URLs
              </CardTitle>
              <CardDescription>
                Endpoint tempat aplikasi ini dapat diakses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Production</p>
                  <p className="truncate font-mono text-sm">{productionUrl}</p>
                </div>
                <a
                  href={productionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2"
                  )}
                >
                  Visit
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Preview</p>
                  <p className="truncate font-mono text-sm">{previewUrl}</p>
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2"
                  )}
                >
                  Visit
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB DEPLOYMENTS ==================== */}
        <TabsContent value="deployments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutList className="h-5 w-5" />
                Riwayat Deployment ({visibleDeployments.length})
              </CardTitle>
              <CardDescription>
                Daftar deployment terbaru proyek ini
                {!canWrite && " (read-only)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleDeployments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada deployment untuk proyek ini.
                </p>
              ) : (
                <div className="divide-y">
                  {visibleDeployments.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{shortHash(dep.id)}
                          </span>{" "}
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
                      <div className="flex shrink-0 items-center gap-2">
                        <DeploymentStatusBadge status={dep.status} />
                        {dep.status === "success" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canWrite}
                            onClick={() => handleRollback(dep.id)}
                          >
                            Rollback
                          </Button>
                        )}
                        {dep.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canWrite}
                            onClick={() => handleRetry(dep.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB LOGS ==================== */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Deployment Logs
              </CardTitle>
              <CardDescription>
                Log build &amp; runtime dari deployment terpilih
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleDeployments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada log deployment untuk proyek ini.
                </p>
              ) : (
                <>
                  <Select
                    value={activeDeployment?.id ?? ""}
                    onValueChange={(value) => setSelectedLogId(value ?? "")}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[320px]"
                      aria-label="Pilih deployment"
                    >
                      <SelectValue placeholder="Pilih deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleDeployments.map((dep) => (
                        <SelectItem key={dep.id} value={dep.id}>
                          #{shortHash(dep.id)} · {dep.branch} —{" "}
                          {dep.commitMessage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {activeDeployment && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DeploymentStatusBadge
                          status={activeDeployment.status}
                        />
                        <span>{activeDeployment.timeLabel}</span>
                      </div>
                      <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                        {activeDeployment.logLines.join("\n")}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB FINOPS ==================== */}
        <TabsContent value="finops" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimasi Biaya Bulanan
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ${monthlyCost.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.deployments} deployment · Agustus 2026 (mock)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Rincian Komponen
                </CardTitle>
                <CardDescription>Estimasi statis per resource</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {FINOPS_BREAKDOWN.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 text-sm font-medium">
                  <span>Total</span>
                  <span className="font-mono">
                    $
                    {FINOPS_BREAKDOWN.reduce(
                      (sum, item) => sum + item.amount,
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <CardDescription>
                Penggunaan budget bulanan proyek ini (${budgetLimit})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ${monthlyCost.toFixed(2)} dari ${budgetLimit}.00
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    overBudget &&
                      "text-destructive border-destructive/40 bg-destructive/10"
                  )}
                >
                  {Math.round((monthlyCost / budgetLimit) * 100)}%
                </Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    overBudget ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  disabled={!canWrite}
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
          <Button onClick={handleSaveSettings} disabled={!canWrite}>
            Simpan Perubahan
          </Button>
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
              <Button variant="destructive" onClick={handleDelete} disabled={!canWrite}>
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
              disabled={!canWrite}
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

