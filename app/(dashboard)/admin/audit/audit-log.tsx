"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  FileText,
  FolderMinus,
  FolderPlus,
  KeyRound,
  LogOut,
  Rocket,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MOCK_AUDIT_LOGS,
  type AuditActionType,
  type MockAuditLog,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const EXTRA_LOGS: MockAuditLog[] = [
  {
    id: "audit-extra-001",
    actor: "Developer OmniStack",
    actionType: "deploy",
    detail: "Deploy gagal: AI Chatbot — build timeout pada step npm install",
    target: "proj-002",
    timeLabel: "30 menit lalu",
  },
  {
    id: "audit-extra-002",
    actor: "Admin OmniStack",
    actionType: "project_created",
    detail: "Menghapus proyek Legacy Monolith dari sistem",
    target: "proj-legacy",
    timeLabel: "2 jam lalu",
  },
  {
    id: "audit-extra-003",
    actor: "Viewer OmniStack",
    actionType: "user_login",
    detail: "Logout dari sesi aktif",
    timeLabel: "3 jam lalu",
  },
  {
    id: "audit-extra-004",
    actor: "Admin OmniStack",
    actionType: "settings_changed",
    detail: "Mengubah pengaturan backup otomatis dari harian menjadi 6-jam",
    target: "system",
    timeLabel: "6 jam lalu",
  },
]

const ALL_LOGS = [...EXTRA_LOGS, ...MOCK_AUDIT_LOGS]

const ACTION_META: Record<
  AuditActionType,
  { icon: typeof KeyRound; label: string; className: string; bg: string; success?: boolean }
> = {
  role_change: {
    icon: Crown,
    label: "Role Change",
    className: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  user_created: {
    icon: KeyRound,
    label: "User Dibuat",
    className: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  user_login: {
    icon: ShieldCheck,
    label: "Login",
    className: "text-green-500",
    bg: "bg-green-500/10",
  },
  deploy: {
    icon: Rocket,
    label: "Deployment",
    className: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  project_created: {
    icon: FolderPlus,
    label: "Proyek",
    className: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  settings_changed: {
    icon: Settings2,
    label: "Pengaturan",
    className: "text-muted-foreground",
    bg: "bg-muted",
  },
}

const ACTOR_ROLE: Record<string, string> = {
  "Admin OmniStack": "ADMIN",
  "Developer OmniStack": "USER",
  "Viewer OmniStack": "VIEWER",
}

const ACTOR_ROLE_COLORS: Record<string, string> = {
  ADMIN: "border-amber-500/40 text-amber-500",
  USER: "border-blue-500/40 text-blue-500",
  VIEWER: "border-emerald-500/40 text-emerald-500",
}

type ActionFilter = "all" | AuditActionType

const ACTION_FILTERS: { value: ActionFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "role_change", label: "Role Change" },
  { value: "user_created", label: "User Dibuat" },
  { value: "user_login", label: "Login" },
  { value: "deploy", label: "Deployment" },
  { value: "project_created", label: "Proyek" },
  { value: "settings_changed", label: "Pengaturan" },
]

type DateFilter = "all" | "24h" | "7d" | "30d"

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
]

const PAGE_SIZE = 10

function isDeployFailed(detail: string): boolean {
  return detail.toLowerCase().includes("gagal") || detail.toLowerCase().includes("timeout")
}

function isDeleteAction(detail: string): boolean {
  return detail.toLowerCase().includes("menghapus") || detail.toLowerCase().includes("delete")
}

export function AuditLogList() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [search, setSearch] = useState("")
  const [actorFilter, setActorFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const uniqueActors = useMemo(
    () => [...new Set(ALL_LOGS.map((l) => l.actor))],
    []
  )

  const filteredLogs = useMemo(() => {
    return ALL_LOGS.filter((log) => {
      if (actionFilter !== "all" && log.actionType !== actionFilter) return false
      if (actorFilter !== "all" && log.actor !== actorFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = `${log.detail} ${log.actor} ${log.target ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [actionFilter, actorFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredLogs.length)

  const handleExportCSV = () => {
    const header = "ID,Aktor,Tipe Aksi,Detail,Target,Waktu"
    const rows = filteredLogs.map(
      (log) =>
        `${log.id},"${log.actor}","${log.actionType}","${log.detail}","${log.target ?? ""}","${log.timeLabel}"`
    )
    const csv = [header, ...rows].join("\n")

    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "audit-trail.csv"
      link.click()
      URL.revokeObjectURL(url)
      setExportNotice("Audit trail CSV exported.")
    } catch {
      setExportNotice("Gagal export CSV.")
    }
    setTimeout(() => setExportNotice(null), 3000)
  }

  const handleExportPDF = () => {
    setExportNotice("Audit trail PDF exported (mock).")
    setTimeout(() => setExportNotice(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <ScrollText className="h-7 w-7 text-primary" />
            Audit Logs
          </h1>
          <p className="mt-1 text-muted-foreground">
            Jejak aktivitas sistem — siapa melakukan apa, dan kapan. Hanya
            ADMIN yang dapat mengakses halaman ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {exportNotice}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari detail, actor, atau target..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-9"
        />
      </div>

      {/* Actor filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Actor:</span>
        <button
          type="button"
          onClick={() => { setActorFilter("all"); setPage(1) }}
          className={cn(
            buttonVariants({ variant: actorFilter === "all" ? "outline" : "ghost", size: "sm" }),
            actorFilter === "all" && "border-primary/50 font-medium"
          )}
        >
          Semua
        </button>
        {uniqueActors.map((actor) => (
          <button
            key={actor}
            type="button"
            onClick={() => { setActorFilter(actor); setPage(1) }}
            className={cn(
              buttonVariants({ variant: actorFilter === actor ? "outline" : "ghost", size: "sm" }),
              actorFilter === actor && "border-primary/50 font-medium"
            )}
          >
            {actor}
          </button>
        ))}
      </div>

      {/* Filter chips — Action Type */}
      <div className="flex flex-wrap items-center gap-2">
        {ACTION_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setActionFilter(f.value); setPage(1) }}
            className={cn(
              buttonVariants({
                variant: actionFilter === f.value ? "outline" : "ghost",
                size: "sm",
              }),
              actionFilter === f.value && "border-primary/50 font-medium"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filter chips — Date Range */}
      <div className="flex flex-wrap items-center gap-2">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setDateFilter(f.value)}
            className={cn(
              buttonVariants({
                variant: dateFilter === f.value ? "outline" : "ghost",
                size: "sm",
              }),
              dateFilter === f.value && "border-primary/50 font-medium"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Diurutkan dari yang paling baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Aktor</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedLogs.map((log) => {
                const meta = ACTION_META[log.actionType]
                const Icon = meta.icon
                const role = ACTOR_ROLE[log.actor] ?? "USER"
                const failed =
                  log.actionType === "deploy" && isDeployFailed(log.detail)
                const deleted =
                  log.actionType === "project_created" && isDeleteAction(log.detail)

                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.timeLabel}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.actor}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            ACTOR_ROLE_COLORS[role]
                          )}
                        >
                          {role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                            meta.bg
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5", meta.className)} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{meta.label}</span>
                          {log.actionType === "deploy" && !failed && (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {log.actionType === "deploy" && failed && (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          {log.actionType === "user_login" && (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {log.actionType === "project_created" && deleted && (
                            <FolderMinus className="h-3.5 w-3.5 text-red-500" />
                          )}
                          {log.actionType === "user_login" && log.detail.includes("Logout") && (
                            <LogOut className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.target ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {log.detail}
                    </TableCell>
                  </TableRow>
                )
              })}
              {pagedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada log yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {rangeStart}–{rangeEnd} dari {filteredLogs.length} log
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
