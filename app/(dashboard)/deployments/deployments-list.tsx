"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Rocket,
  RotateCcw,
  Search,
  Terminal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { useAuth } from "@/lib/auth-context"
import {
  getMockDeploymentsForRole,
  getMockProjectsByUser,
  MOCK_PROJECTS,
  type MockDeployment,
  type DeploymentStatus,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "Semua Deployment",
  USER: "Deployment Saya",
  VIEWER: "Deployment yang Di-share",
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "success", label: "Success" },
  { value: "building", label: "Building" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
]

const PAGE_SIZE = 5

const DATE_SORT_OPTIONS: { value: DateSort; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
]

type DateSort = "newest" | "oldest"

const TIME_UNIT_SECONDS: Record<string, number> = {
  detik: 1,
  menit: 60,
  jam: 3600,
  hari: 86400,
  minggu: 604800,
  bulan: 2592000,
}

function getTimeLabelSecondsAgo(label: string): number {
  const normalized = label.trim().toLowerCase()
  if (normalized === "baru saja") return 0
  if (normalized.includes("kemarin")) return TIME_UNIT_SECONDS.hari
  const match = normalized.match(/(\d+)\s*(detik|menit|jam|hari|minggu|bulan)/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1]) * TIME_UNIT_SECONDS[match[2]]
}

function getEffectiveStatus(d: MockDeployment): DeploymentStatus | "cancelled" | "rolled_back" {
  if (d.logLines.some((l) => l.includes("Dibatalkan"))) return "cancelled"
  if (d.status === "success" && d.logLines.some((l) => l.includes("Rollback"))) return "rolled_back"
  return d.status
}

function getShortCommitHash(deploymentId: string): string {
  const seed = deploymentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hex = seed.toString(16).padStart(7, "0").slice(0, 7)
  return hex
}

const EFFECTIVE_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  cancelled: {
    label: "Cancelled",
    className: "text-orange-500 border-orange-500/40 bg-orange-500/10",
    dot: "bg-orange-500",
  },
  rolled_back: {
    label: "Rolled Back",
    className: "text-blue-500 border-blue-500/40 bg-blue-500/10",
    dot: "bg-blue-500",
  },
}

function EffectiveStatusBadge({ status }: { status: DeploymentStatus | "cancelled" | "rolled_back" }) {
  const custom = EFFECTIVE_STATUS_CONFIG[status]
  if (custom) {
    return (
      <Badge variant="outline" className={cn("gap-1.5", custom.className)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", custom.dot)} />
        {custom.label}
      </Badge>
    )
  }
  return <DeploymentStatusBadge status={status as DeploymentStatus} />
}

export function DeploymentsList() {
  const { user } = useAuth()
  const [deployments, setDeployments] = useState<MockDeployment[]>(() =>
    getMockDeploymentsForRole(user?.id ?? "", user?.role ?? "VIEWER")
  )
  useEffect(() => {
    if (!user) return
    let cancelled = false

    const seed = async () => {
      await Promise.resolve()
      if (!cancelled) {
        setDeployments(getMockDeploymentsForRole(user.id, user.role))
      }
    }

    seed()
    return () => {
      cancelled = true
    }
  }, [user])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [triggeredByFilter, setTriggeredByFilter] = useState<string>("all")
  const [dateSort, setDateSort] = useState<DateSort>("newest")
  const [currentPage, setCurrentPage] = useState(1)

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const projectNameOf = (projectId: string) =>
    MOCK_PROJECTS.find((p) => p.id === projectId)?.name ?? projectId

  const uniqueTriggeredBy = useMemo(() => {
    const set = new Set(deployments.map((d) => d.triggeredBy))
    return Array.from(set)
  }, [deployments])

  const filteredDeployments = useMemo(() => {
    let result = deployments

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          projectNameOf(d.projectId).toLowerCase().includes(q) ||
          d.branch.toLowerCase().includes(q)
      )
    }

    if (projectFilter !== "all") {
      result = result.filter((d) => d.projectId === projectFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => getEffectiveStatus(d) === statusFilter)
    }

    if (triggeredByFilter !== "all") {
      result = result.filter((d) => d.triggeredBy === triggeredByFilter)
    }

    result = [...result].sort((a, b) => {
      const timeA = getTimeLabelSecondsAgo(a.timeLabel)
      const timeB = getTimeLabelSecondsAgo(b.timeLabel)
      return dateSort === "newest" ? timeA - timeB : timeB - timeA
    })

    return result
  }, [deployments, searchQuery, projectFilter, statusFilter, triggeredByFilter, dateSort])

  const resetFilters = () => {
    setSearchQuery("")
    setProjectFilter("all")
    setStatusFilter("all")
    setTriggeredByFilter("all")
    setDateSort("newest")
    setCurrentPage(1)
  }

  if (!user) return null

  const isViewer = user.role === "VIEWER"
  const projects = getMockProjectsByUser(user.id, user.role)

  const queueCount = deployments.filter(
    (d) => d.status === "queued" || d.status === "building"
  ).length

  const totalPages = Math.max(1, Math.ceil(filteredDeployments.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const pagedDeployments = filteredDeployments.slice(startIdx, startIdx + PAGE_SIZE)

  const selected =
    deployments.find((d) => d.id === selectedId) ?? deployments[0]

  const handleRollback = () => {
    if (!selected || selected.status === "building" || selected.status === "queued")
      return
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === selected.id
          ? {
              ...d,
              status: "success",
              logLines: [
                ...d.logLines,
                "✓ Rollback ke revisi sebelumnya berhasil (mock)",
              ],
            }
          : d
      )
    )
    showNotice("Rollback ke revisi sebelumnya berhasil.")
  }

  const handleCancel = (id: string) => {
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "failed",
              logLines: [...d.logLines, "✗ Dibatalkan oleh user (mock)"],
            }
          : d
      )
    )
    showNotice("Deployment dibatalkan.")
  }

  const handleForceRedeploy = () => {
    if (!selected) return
    const redeploy: MockDeployment = {
      id: `deploy-redeploy-${Date.now()}`,
      projectId: selected.projectId,
      branch: `${selected.branch}-redeploy`,
      commitMessage: selected.commitMessage,
      status: "building",
      triggeredBy: user.email,
      timeLabel: "baru saja",
      logLines: ["$ omnistack deploy --force", "→ Build ulang dimulai..."],
    }
    setDeployments((prev) => [redeploy, ...prev])
    setSelectedId(redeploy.id)
    showNotice(`Force redeploy dimulai untuk branch ${redeploy.branch}.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Rocket className="h-7 w-7 text-primary" />
          {TITLE_BY_ROLE[user.role]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isViewer
            ? "Riwayat deployment proyek yang di-share ke Anda (read-only)."
            : `${deployments.length} deployment pada ${projects.length} proyek.`}
        </p>
      </div>

      {/* Notice feedback */}
      {notice && (
        <p className="text-sm font-medium text-primary" role="status">
          {notice}
        </p>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari project atau branch..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-8"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
        >
          <option value="all">Semua Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={triggeredByFilter}
          onChange={(e) => {
            setTriggeredByFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
        >
          <option value="all">Semua Pelaku</option>
          {uniqueTriggeredBy.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <Select
          value={dateSort}
          onValueChange={(v) => {
            setDateSort((v ?? "newest") as DateSort)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[120px]" aria-label="Urutkan tanggal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Daftar deployment */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Riwayat</CardTitle>
            <CardDescription>Klik baris untuk melihat log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {pagedDeployments.map((deployment) => {
                const effectiveStatus = getEffectiveStatus(deployment)
                return (
                  <div
                    key={deployment.id}
                    className={cn(
                      "flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 transition-colors",
                      !isViewer && "hover:bg-muted/30 -mx-2 px-2 rounded-md",
                      selected?.id === deployment.id && "bg-muted/40 -mx-2 px-2 rounded-md"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(deployment.id)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {projectNameOf(deployment.projectId)}
                        </p>
                        <p className="truncate text-xs text-foreground/80">
                          {deployment.commitMessage}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          <GitBranch className="mr-1 inline h-3 w-3" />
                          {deployment.branch}
                          <span className="mx-1.5 text-muted-foreground/50">·</span>
                          <span className="rounded bg-muted px-1 py-0.5 text-[10px]">
                            {getShortCommitHash(deployment.id)}
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <EffectiveStatusBadge status={effectiveStatus} />
                        <span className="text-xs text-muted-foreground">
                          {deployment.timeLabel}
                        </span>
                      </div>
                    </button>
                    {!isViewer &&
                      (deployment.status === "building" ||
                        deployment.status === "queued") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleCancel(deployment.id)}
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          Batalkan
                        </Button>
                      )}
                  </div>
                )
              })}
            </div>

            {pagedDeployments.length === 0 && (
              <div className="mt-2 flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
                <Search className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Tidak ada deployment yang cocok dengan filter.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">
                {filteredDeployments.length === 0
                  ? "Menampilkan 0–0 dari 0 deployment"
                  : `Menampilkan ${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, filteredDeployments.length)} dari ${filteredDeployments.length} deployment`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {safePage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail log + aksi */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {selected && (
            <Card className="overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100">
              <CardHeader className="border-b border-zinc-800 bg-zinc-900 pb-3">
                <CardTitle className="flex items-center gap-2 font-mono text-sm text-zinc-300">
                  <Terminal className="h-3.5 w-3.5" />
                  log://{selected.id}
                </CardTitle>
                <CardDescription className="font-mono text-xs text-zinc-500">
                  {selected.branch} oleh {selected.triggeredBy}
                  {selected.durationLabel ? ` · ${selected.durationLabel}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-4 font-mono text-xs leading-relaxed text-zinc-300">
                {selected.logLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {!isViewer ? (
            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
                <CardDescription>Manajemen deployment</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={
                    !selected ||
                    selected.status === "building" ||
                    selected.status === "queued"
                  }
                  onClick={handleRollback}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rollback Versi Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!selected}
                  onClick={handleForceRedeploy}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Force Redeploy
                </Button>
                <Link
                  href="/ai-architect"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy Proyek Baru
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Queue: {queueCount} menunggu
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Mode read-only: rollback dan deploy tidak tersedia untuk role Viewer.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
