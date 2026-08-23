"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Circle,
  Filter,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { MOCK_PROJECTS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type ErrorStatus = "New" | "Investigating" | "Resolved"
type ErrorSeverity = "Critical" | "Warning" | "Info"

interface TrackedError {
  id: string
  message: string
  stackSnippet: string
  fullStack: string
  project: string
  count: number
  firstSeen: string
  lastSeen: string
  status: ErrorStatus
  severity: ErrorSeverity
  affectedUsers: number
  suggestedFix: string
}

const MOCK_ERRORS: TrackedError[] = [
  {
    id: "err-001",
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    stackSnippet: "at ProductList.render (components/product-list.tsx:42:18)",
    fullStack: `TypeError: Cannot read properties of undefined (reading 'map')
  at ProductList.render (components/product-list.tsx:42:18)
  at processChild (node_modules/react-dom/cjs/react-dom.development.js:3434:18)
  at reconcileChildren (node_modules/react-dom/cjs/react-dom.development.js:4296:14)
  at reconcileChildFibers (node_modules/react-dom/cjs/react-dom.development.js:4329:26)
  at reconcileChildren (node_modules/react-dom/cjs/react-dom.development.js:4369:24)
  at updateHostComponent (node_modules/react-dom/cjs/react-dom.development.js:4720:18)`,
    project: "E-Commerce Platform",
    count: 234,
    firstSeen: "2 hari lalu",
    lastSeen: "5 menit lalu",
    status: "New",
    severity: "Critical",
    affectedUsers: 189,
    suggestedFix: "Tambah null check sebelum memanggil .map() pada props.products. Pastikan fallback ke array kosong: (products ?? []).map(...)",
  },
  {
    id: "err-002",
    message: "OpenAI APIError: Rate limit exceeded (429)",
    stackSnippet: "at ChatHandler.process (lib/chat-handler.ts:87:12)",
    fullStack: `OpenAI APIError: Rate limit exceeded (429)
  at ChatHandler.process (lib/chat-handler.ts:87:12)
  at async POST (app/api/chat/route.ts:15:18)
  at async /node_modules/next/dist/server/future/route-modules/app-route/module.js:50:21`,
    project: "AI Chatbot",
    count: 87,
    firstSeen: "1 hari lalu",
    lastSeen: "12 menit lalu",
    status: "Investigating",
    severity: "Warning",
    affectedUsers: 45,
    suggestedFix: "Implement exponential backoff dan retry queue. Pertimbangkan caching response untuk query yang sering sama.",
  },
  {
    id: "err-003",
    message: "DatabaseError: Connection pool exhausted (max: 20)",
    stackSnippet: "at Pool.connect (lib/db/pool.ts:34:15)",
    fullStack: `DatabaseError: Connection pool exhausted (max: 20)
  at Pool.connect (lib/db/pool.ts:34:15)
  at async query (lib/db/index.ts:12:18)
  at async GET (app/api/projects/route.ts:8:20)`,
    project: "SaaS Dashboard",
    count: 156,
    firstSeen: "3 hari lalu",
    lastSeen: "20 menit lalu",
    status: "New",
    severity: "Critical",
    affectedUsers: 312,
    suggestedFix: "Tingkatkan pool limit atau tambah connection pooling dengan PgBouncer. Audit query yang tidak di-close.",
  },
  {
    id: "err-004",
    message: "TimeoutError: Function timed out after 30000ms",
    stackSnippet: "at withTimeout (lib/timeout.ts:8:11)",
    fullStack: `TimeoutError: Function timed out after 30000ms
  at withTimeout (lib/timeout.ts:8:11)
  at async generateReport (lib/report-generator.ts:22:5)
  at async POST (app/api/reports/route.ts:10:18)`,
    project: "SaaS Dashboard",
    count: 42,
    firstSeen: "5 hari lalu",
    lastSeen: "1 jam lalu",
    status: "Resolved",
    severity: "Warning",
    affectedUsers: 28,
    suggestedFix: "Optimasi query untuk report generation — gunakan aggregation pipeline dan pagination.",
  },
  {
    id: "err-005",
    message: "SyntaxError: Unexpected token '<' in JSON at position 0",
    stackSnippet: "at JSON.parse (<anonymous>) at fetchProjects (lib/api.ts:15:20)",
    fullStack: `SyntaxError: Unexpected token '<' in JSON at position 0
  at JSON.parse (<anonymous>)
  at fetchProjects (lib/api.ts:15:20)
  at async ProjectsPage (app/projects/page.tsx:12:18)`,
    project: "Portfolio Website",
    count: 18,
    firstSeen: "1 minggu lalu",
    lastSeen: "3 jam lalu",
    status: "Resolved",
    severity: "Info",
    affectedUsers: 5,
    suggestedFix: "Server mengembalikan HTML error page bukan JSON. Tambahkan check response.ok sebelum JSON.parse.",
  },
  {
    id: "err-006",
    message: "PaymentError: Stripe signature verification failed",
    stackSnippet: "at verifyWebhook (lib/stripe.ts:28:9)",
    fullStack: `PaymentError: Stripe signature verification failed
  at verifyWebhook (lib/stripe.ts:28:9)
  at async POST (app/api/webhook/route.ts:12:18)
  at async /node_modules/next/dist/server/future/route-modules/app-route/module.js:50:21`,
    project: "E-Commerce Platform",
    count: 31,
    firstSeen: "4 hari lalu",
    lastSeen: "6 jam lalu",
    status: "Investigating",
    severity: "Critical",
    affectedUsers: 67,
    suggestedFix: "Periksa STRIPE_WEBHOOK_SECRET — kemungkinan key berubah setelah rotate. Pastikan raw body dikirim ke Stripe.",
  },
  {
    id: "err-007",
    message: "ImageError: Failed to optimize image — exceeds 4MB limit",
    stackSnippet: "at optimizeImage (lib/image-optimizer.ts:12:7)",
    fullStack: `ImageError: Failed to optimize image — exceeds 4MB limit
  at optimizeImage (lib/image-optimizer.ts:12:7)
  at async uploadHandler (app/api/upload/route.ts:18:14)`,
    project: "Portfolio Website",
    count: 9,
    firstSeen: "2 minggu lalu",
    lastSeen: "1 hari lalu",
    status: "Resolved",
    severity: "Info",
    affectedUsers: 3,
    suggestedFix: "Tambah client-side resize sebelum upload atau tingkatkan limit di server-side dengan streaming.",
  },
  {
    id: "err-008",
    message: "WebSocketError: Connection closed abnormally (code: 1006)",
    stackSnippet: "at WebSocket.onclose (lib/ws-client.ts:45:10)",
    fullStack: `WebSocketError: Connection closed abnormally (code: 1006)
  at WebSocket.onclose (lib/ws-client.ts:45:10)
  at WebSocket.addEventListener (lib/ws-client.ts:22:5)`,
    project: "AI Chatbot",
    count: 22,
    firstSeen: "6 hari lalu",
    lastSeen: "2 jam lalu",
    status: "New",
    severity: "Warning",
    affectedUsers: 15,
    suggestedFix: "Implement reconnect dengan exponential backoff. Tambah heartbeat check setiap 30 detik.",
  },
]

const STATUS_META: Record<ErrorStatus, { className: string; bg: string }> = {
  New: { className: "text-red-500", bg: "bg-red-500/10" },
  Investigating: { className: "text-yellow-500", bg: "bg-yellow-500/10" },
  Resolved: { className: "text-green-500", bg: "bg-green-500/10" },
}

const SEVERITY_META: Record<ErrorSeverity, { className: string }> = {
  Critical: { className: "text-destructive" },
  Warning: { className: "text-yellow-500" },
  Info: { className: "text-blue-500" },
}

const USERS = ["Admin OmniStack", "Developer OmniStack", "Viewer OmniStack"]

export function ErrorTrackingClient() {
  const { user } = useAuth()

  const [errors, setErrors] = useState<TrackedError[]>(MOCK_ERRORS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [assignDropdown, setAssignDropdown] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!user) return null

  const isViewer = user.role === "VIEWER"

  const filteredErrors = errors.filter((err) => {
    if (filterProject !== "all" && err.project !== filterProject) return false
    if (filterStatus !== "all" && err.status !== filterStatus) return false
    if (filterSeverity !== "all" && err.severity !== filterSeverity) return false
    if (searchQuery && !err.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalErrors = errors.reduce((sum, e) => sum + e.count, 0)
  const totalAffected = new Set(errors.flatMap((e) => Array.from({ length: e.affectedUsers }, (_, i) => `${e.id}-user-${i}`))).size
  const openErrors = errors.filter((e) => e.status !== "Resolved").length

  const showNotice = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  const updateStatus = (id: string, status: ErrorStatus) => {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
    setAssignDropdown(null)
    showNotice(`Error ${id} ditandai sebagai ${status}`)
  }

  const assignTo = (id: string, assignee: string) => {
    setAssignDropdown(null)
    showNotice(`Error ${id} ditugaskan ke ${assignee}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Bug className="h-7 w-7 text-primary" />
          Error Tracking
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pantau dan tangani error dari semua proyek Anda dalam satu tempat.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Error</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">dari {errors.length} error unik</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Terdampak</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffected}</div>
            <p className="text-xs text-muted-foreground">pengguna mengalami error</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Terbuka</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openErrors}</div>
            <p className="text-xs text-muted-foreground">belum terselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari error..."
                className="h-8 w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Semua Proyek</option>
                {MOCK_PROJECTS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">Semua Status</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">Semua Severity</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
            <span className="text-xs text-muted-foreground">
              {filteredErrors.length} dari {errors.length} error
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border bg-background p-4 shadow-lg">
          <p className="text-sm">{notice}</p>
        </div>
      )}

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Error ({filteredErrors.length})</CardTitle>
          <CardDescription>Klik untuk melihat detail lengkap stack trace dan saran perbaikan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredErrors.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada error yang cocok dengan filter.
              </p>
            ) : (
              filteredErrors.map((err) => {
                const isExpanded = expandedId === err.id
                const statusMeta = STATUS_META[err.status]
                const sevMeta = SEVERITY_META[err.severity]

                return (
                  <div
                    key={err.id}
                    className={cn(
                      "rounded-lg border transition-colors",
                      isExpanded && "bg-muted/30"
                    )}
                  >
                    {/* Error Summary Row */}
                    <button
                      className="flex w-full items-center gap-3 p-4 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : err.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("shrink-0", statusMeta.className)}>
                            {err.status}
                          </Badge>
                          <Badge variant="ghost" className={cn("shrink-0 text-[10px]", sevMeta.className)}>
                            {err.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">×{err.count}</span>
                        </div>
                        <p className="truncate font-mono text-sm font-medium">{err.message}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {err.stackSnippet}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">{err.project}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {err.affectedUsers} pengguna
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t px-4 pb-4 pt-3 space-y-4">
                        {/* Meta */}
                        <div className="grid gap-4 sm:grid-cols-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Proyek</p>
                            <p className="font-medium">{err.project}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Pertama Terlihat</p>
                            <p className="font-medium">{err.firstSeen}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Terakhir Terlihat</p>
                            <p className="font-medium">{err.lastSeen}</p>
                          </div>
                        </div>

                        {/* Full Stack Trace */}
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Stack Trace</p>
                          <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
                            {err.fullStack}
                          </pre>
                        </div>

                        {/* Suggested Fix */}
                        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                          <p className="mb-1 text-xs font-medium text-primary">Saran Perbaikan</p>
                          <p className="text-sm">{err.suggestedFix}</p>
                        </div>

                        {/* Actions */}
                        {!isViewer && (
                          <div className="flex flex-wrap items-center gap-2">
                            {err.status !== "Investigating" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(err.id, "Investigating")}
                              >
                                Tandai Investigating
                              </Button>
                            )}
                            {err.status !== "Resolved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(err.id, "Resolved")}
                              >
                                Tandai Resolved
                              </Button>
                            )}
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAssignDropdown(assignDropdown === err.id ? null : err.id)}
                              >
                                <UserCheck className="mr-1 h-3 w-3" />
                                Assign ke...
                              </Button>
                              {assignDropdown === err.id && (
                                <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border bg-background p-1 shadow-md">
                                  {USERS.map((u) => (
                                    <button
                                      key={u}
                                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                      onClick={() => assignTo(err.id, u)}
                                    >
                                      {u}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
