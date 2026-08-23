"use client"

import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  Bell,
  Clock,
  Download,
  FileText,
  Filter,
  Gauge,
  MousePointerClick,
  Plus,
  Search,
  Timer,
  Trash2,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { MOCK_PROJECTS, type Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "Monitoring Sistem",
  USER: "Monitoring Proyek Anda",
  VIEWER: "Monitoring (Read-Only)",
}

const AP_STATS = [
  { title: "Uptime", value: "99.9%", note: "30 hari terakhir", icon: Activity },
  { title: "Avg Response", value: "142ms", note: "-8ms vs minggu lalu", icon: Timer },
  { title: "Error Rate", value: "0.3%", note: "24 error / 8.4k request", icon: AlertTriangle },
  { title: "Request/min", value: "1.2k", note: "Puncak 3.4k", icon: Zap },
]

// Core Web Vitals — nilai & ambang ala Google
const WEB_VITALS = [
  { name: "LCP", label: "Largest Contentful Paint", value: "1.2s", good: true },
  { name: "INP", label: "Interaction to Next Paint", value: "84ms", good: true },
  { name: "CLS", label: "Cumulative Layout Shift", value: "0.02", good: true },
]

// Utilisasi node cluster (bar sederhana tanpa chart lib)
const NODES = [
  { name: "node-sgp-01", cpu: 42, ram: 61 },
  { name: "node-jkt-02", cpu: 78, ram: 84 },
  { name: "node-fra-03", cpu: 23, ram: 39 },
]

type LogLevel = "INFO" | "WARN" | "ERROR"

interface LogEntry {
  id: string
  timestamp: string
  project: string
  level: LogLevel
  message: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: "log-001", timestamp: "14:32:01", project: "E-Commerce Platform", level: "INFO", message: "Deployment v2.4.1 berhasil ke production" },
  { id: "log-002", timestamp: "14:28:45", project: "E-Commerce Platform", level: "WARN", message: "Response time meningkat > 500ms pada /api/checkout" },
  { id: "log-003", timestamp: "14:15:22", project: "AI Chatbot", level: "ERROR", message: "OpenAI API timeout setelah 30s — retry attempt 3/3" },
  { id: "log-004", timestamp: "13:58:10", project: "AI Chatbot", level: "INFO", message: "Health check passed — semua service normal" },
  { id: "log-005", timestamp: "13:42:33", project: "Portfolio Website", level: "INFO", message: "CDN cache di-purge untuk static assets" },
  { id: "log-006", timestamp: "13:20:11", project: "SaaS Dashboard", level: "ERROR", message: "Database connection pool exhausted — max 20 connections" },
  { id: "log-007", timestamp: "12:55:44", project: "E-Commerce Platform", level: "INFO", message: "Webhook Stripe diterima — order #ORD-8821 diproses" },
  { id: "log-008", timestamp: "12:30:00", project: "Portfolio Website", level: "WARN", message: "Memory usage mencapai 85% pada container" },
]

const LEVEL_META: Record<LogLevel, { className: string; bg: string }> = {
  INFO: { className: "text-blue-500", bg: "bg-blue-500/10" },
  WARN: { className: "text-yellow-500", bg: "bg-yellow-500/10" },
  ERROR: { className: "text-destructive", bg: "bg-destructive/10" },
}

interface AlertRule {
  id: string
  metric: string
  threshold: string
  channel: string
  enabled: boolean
}

const INITIAL_ALERT_RULES: AlertRule[] = [
  { id: "rule-001", metric: "Error Rate", threshold: "> 5%", channel: "Slack #alerts", enabled: true },
  { id: "rule-002", metric: "Response Time", threshold: "> 2000ms", channel: "Email admin@omnistack.dev", enabled: true },
  { id: "rule-003", metric: "CPU Usage", threshold: "> 90%", channel: "Discord #ops", enabled: false },
]

const METRICS = ["Error Rate", "Response Time", "CPU Usage", "RAM Usage", "Request/min", "Uptime"]
const CHANNELS = ["Slack #alerts", "Slack #ops", "Discord #ops", "Email admin@omnistack.dev", "Email team@omnistack.dev", "Webhook"]

const TIME_RANGES = ["Last 1h", "Last 24h", "Last 7d", "Last 30d"]

const RESPONSE_TIMES = [
  { label: "00:00", value: 120, max: 500 },
  { label: "06:00", value: 89, max: 500 },
  { label: "12:00", value: 210, max: 500 },
  { label: "18:00", value: 142, max: 500 },
  { label: "Now", value: 98, max: 500 },
]

const ERROR_RATES = [
  { service: "billing-api", rate: 2.1 },
  { service: "auth-service", rate: 1.2 },
  { service: "company-site", rate: 0.5 },
  { service: "mobile-api", rate: 0.3 },
]

const RECENT_ERRORS = [
  { time: "2026-08-22 14:32", service: "billing-api", type: "500 Internal", count: 12 },
  { time: "2026-08-22 14:15", service: "auth-service", type: "401 Unauth", count: 8 },
  { time: "2026-08-22 13:00", service: "company-site", type: "404 Not Found", count: 3 },
]

// Realtime metrics — 12 titik sampel (interval 5 menit)
const CPU_SERIES = [34, 41, 38, 52, 47, 63, 58, 72, 78, 66, 54, 62]
const MEMORY_SERIES_MB = [820, 940, 1010, 1180, 1120, 1340, 1420, 1560, 1610, 1480, 1390, 1430]
const SERIES_LABELS = ["0m", "5m", "10m", "15m", "20m", "25m", "30m", "35m", "40m", "45m", "50m", "55m"]

// APM statis ala blueprint
const APM_STATS = [
  { title: "Response Time p95", value: "120ms", note: "Target < 200ms", icon: Timer },
  { title: "Error Rate", value: "0.1%", note: "Stabil 24 jam terakhir", icon: AlertTriangle },
  { title: "Throughput", value: "450 req/s", note: "Rata-rata per menit", icon: Zap },
]

function summarizeSeries(series: number[]) {
  const avg = series.reduce((sum, v) => sum + v, 0) / series.length
  const peak = Math.max(...series)
  return { avg, peak, current: series[series.length - 1] }
}

function formatMemory(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb}MB`
}

function SeriesChart({
  values,
  max,
  title,
  description,
  format,
}: {
  values: number[]
  max: number
  title: string
  description: string
  format: (v: number) => string
}) {
  const { avg, peak, current } = summarizeSeries(values)
  const width = 100
  const height = 40
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - (v / max) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={title}
          className="h-28 w-full text-primary"
        >
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} className="stroke-border" strokeWidth="0.25" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} className="stroke-border" strokeWidth="0.25" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} className="stroke-border" strokeWidth="0.25" />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          {SERIES_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Avg: <span className="font-mono text-foreground">{format(avg)}</span>
          {" · "}Peak: <span className="font-mono text-foreground">{format(peak)}</span>
          {" · "}Current: <span className="font-mono text-foreground">{format(current)}</span>
        </p>
      </CardContent>
    </Card>
  )
}

export function MonitoringClient() {
  const { user } = useAuth()

  const [logFilterProject, setLogFilterProject] = useState<string>("all")
  const [logFilterLevel, setLogFilterLevel] = useState<string>("all")
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES)
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRule, setNewRule] = useState({ metric: METRICS[0], threshold: "> 5%", channel: CHANNELS[0] })
  const [notice, setNotice] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string>("Last 24h")

  if (!user) return null

  const isViewer = user.role === "VIEWER"

  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (logFilterProject !== "all" && log.project !== logFilterProject) return false
    if (logFilterLevel !== "all" && log.level !== logFilterLevel) return false
    return true
  })

  const errorLogs = MOCK_LOGS.filter((log) => log.level === "ERROR")

  const toggleRule = (id: string) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const deleteRule = (id: string) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id))
  }

  const addRule = () => {
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      metric: newRule.metric,
      threshold: newRule.threshold,
      channel: newRule.channel,
      enabled: true,
    }
    setAlertRules((prev) => [...prev, rule])
    setShowAddRule(false)
    setNewRule({ metric: METRICS[0], threshold: "> 5%", channel: CHANNELS[0] })
  }

  const showNotice = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Gauge className="h-7 w-7 text-primary" />
          {TITLE_BY_ROLE[user.role]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          APM, Core Web Vitals dari pengguna nyata, dan kesehatan node cluster.
        </p>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border bg-background p-4 shadow-lg">
          <p className="text-sm">{notice}</p>
        </div>
      )}

      <Tabs defaultValue="overview" className="gap-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="px-3">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="px-3">Performance</TabsTrigger>
          <TabsTrigger value="logs" className="px-3">Logs</TabsTrigger>
          <TabsTrigger value="errors" className="px-3">Errors</TabsTrigger>
          <TabsTrigger value="apm" className="px-3">APM</TabsTrigger>
        </TabsList>

        {/* ==================== OVERVIEW ==================== */}
        <TabsContent value="overview" className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {AP_STATS.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rentang waktu:</span>
            <div className="flex gap-1">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Node cluster + Alert rules CRUD */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Node cluster */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Kesehatan Node</CardTitle>
                <CardDescription>CPU / RAM per VPS di cluster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {NODES.map((node) => (
                  <div key={node.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono">{node.name}</span>
                      <span className="text-muted-foreground">
                        CPU {node.cpu}% · RAM {node.ram}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          node.cpu > 75 ? "bg-yellow-500" : "bg-primary"
                        )}
                        style={{ width: `${node.cpu}%` }}
                      />
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          node.ram > 80 ? "bg-destructive" : "bg-primary/60"
                        )}
                        style={{ width: `${node.ram}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerting Configuration */}
            <Card className={cn("lg:col-span-3", isViewer && "opacity-90")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Aturan Alerting
                </CardTitle>
                <CardDescription>Konfigurasi notifikasi otomatis berdasarkan metrik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Existing Rules */}
                {alertRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{rule.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        {rule.threshold} → {rule.channel}
                      </p>
                    </div>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isViewer}
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.enabled ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    {!isViewer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add New Rule Form */}
                {showAddRule && !isViewer && (
                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    <p className="text-sm font-medium">Tambah Aturan Baru</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Metrik</label>
                        <select
                          value={newRule.metric}
                          onChange={(e) => setNewRule((r) => ({ ...r, metric: e.target.value }))}
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {METRICS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Threshold</label>
                        <Input
                          value={newRule.threshold}
                          onChange={(e) => setNewRule((r) => ({ ...r, threshold: e.target.value }))}
                          placeholder="> 5%"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Channel</label>
                        <select
                          value={newRule.channel}
                          onChange={(e) => setNewRule((r) => ({ ...r, channel: e.target.value }))}
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {CHANNELS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addRule}>
                        <Plus className="mr-1 h-3 w-3" />
                        Simpan
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddRule(false)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {!showAddRule && !isViewer && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddRule(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Aturan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== PERFORMANCE ==================== */}
        <TabsContent value="performance" className="flex flex-col gap-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <SeriesChart
              values={CPU_SERIES}
              max={100}
              title="CPU Usage (%)"
              description={`Realtime terakhir — rentang ${timeRange.toLowerCase()}`}
              format={(v) => `${Math.round(v)}%`}
            />
            <SeriesChart
              values={MEMORY_SERIES_MB}
              max={2048}
              title="Memory Usage (MB)"
              description={`Realtime terakhir — rentang ${timeRange.toLowerCase()}`}
              format={formatMemory}
            />
          </div>

          {/* Web vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-primary" />
                Real User Monitoring
              </CardTitle>
              <CardDescription>Core Web Vitals dari browser pengguna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {WEB_VITALS.map((vital) => (
                <div
                  key={vital.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">{vital.name}</p>
                    <p className="text-xs text-muted-foreground">{vital.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{vital.value}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        vital.good && "text-green-500 border-green-500/40 bg-green-500/10"
                      )}
                    >
                      Good
                    </Badge>
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted-foreground">
                Data dikumpulkan dari 1,248 sesi pengunjung dalam 24 jam terakhir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LOGS ==================== */}
        <TabsContent value="logs" className="flex flex-col gap-6">
          {/* Project Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Project Logs
              </CardTitle>
              <CardDescription>
                Log dari semua proyek — filter berdasarkan proyek dan level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={logFilterProject}
                    onChange={(e) => setLogFilterProject(e.target.value)}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="all">Semua Proyek</option>
                    {MOCK_PROJECTS.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={logFilterLevel}
                    onChange={(e) => setLogFilterLevel(e.target.value)}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="all">Semua Level</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
                <span className="text-xs text-muted-foreground">
                  {filteredLogs.length} dari {MOCK_LOGS.length} log
                </span>
              </div>

              <div className="divide-y rounded-lg border">
                {filteredLogs.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    Tidak ada log yang cocok dengan filter.
                  </p>
                ) : (
                  filteredLogs.map((log) => {
                    const meta = LEVEL_META[log.level]
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 px-4 py-3 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                          {log.timestamp}
                        </span>
                        <Badge variant="outline" className={cn("shrink-0", meta.className)}>
                          {log.level}
                        </Badge>
                        <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">
                          {log.project}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm">{log.message}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4 text-muted-foreground" />
                Export Laporan
              </CardTitle>
              <CardDescription>Unduh laporan monitoring dalam berbagai format</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isViewer}
                onClick={() => showNotice("CSV laporan monitoring sedang disiapkan...")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isViewer}
                onClick={() => showNotice("Full log sedang diunduh...")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download Full Log
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isViewer}
                onClick={() => showNotice("PDF laporan monitoring sedang disiapkan...")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ERRORS ==================== */}
        <TabsContent value="errors" className="flex flex-col gap-6">
          {/* Error Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Error Logs
              </CardTitle>
              <CardDescription>Entri berlevel ERROR dari semua proyek</CardDescription>
            </CardHeader>
            <CardContent>
              {errorLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium">Tidak ada error</p>
                  <p className="text-xs text-muted-foreground">
                    Semua service berjalan normal — tidak ada entri ERROR.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {errorLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3"
                    >
                      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground pt-0.5">
                        {log.timestamp}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", LEVEL_META[log.level].className)}
                      >
                        {log.level}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{log.project}</p>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Rate by Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Error Rate by Service
              </CardTitle>
              <CardDescription>Persentase error per service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const maxRate = Math.max(...ERROR_RATES.map((r) => r.rate))
                return ERROR_RATES.map((item) => {
                  const color = item.rate > 1.5 ? "bg-destructive" : item.rate > 0.8 ? "bg-yellow-500" : "bg-green-500"
                  const textColor = item.rate > 1.5 ? "text-destructive" : item.rate > 0.8 ? "text-yellow-500" : "text-green-500"
                  return (
                    <div key={item.service} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs">{item.service}</span>
                      <div className="flex-1">
                        <div className="h-5 w-full overflow-hidden rounded bg-muted">
                          <div
                            className={cn("h-full rounded transition-all", color)}
                            style={{ width: `${(item.rate / maxRate) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn("w-14 shrink-0 text-right font-mono text-xs", textColor)}>
                        {item.rate}%
                      </span>
                    </div>
                  )
                })
              })()}
            </CardContent>
          </Card>

          {/* Recent Errors Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Error Terbaru
              </CardTitle>
              <CardDescription>Daftar error terakhir dari semua service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-lg border">
                <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="w-40 shrink-0">Timestamp</span>
                  <span className="w-32 shrink-0">Service</span>
                  <span className="w-32 shrink-0">Tipe Error</span>
                  <span className="ml-auto w-16 text-right">Jumlah</span>
                </div>
                {RECENT_ERRORS.map((err, idx) => (
                  <div
                    key={`${err.time}-${idx}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="w-40 shrink-0 font-mono text-xs text-muted-foreground">
                      {err.time}
                    </span>
                    <span className="w-32 shrink-0 text-xs">{err.service}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        err.type.startsWith("5")
                          ? "text-destructive border-destructive/40 bg-destructive/10"
                          : "text-yellow-500 border-yellow-500/40 bg-yellow-500/10"
                      )}
                    >
                      {err.type}
                    </Badge>
                    <span className="ml-auto w-16 text-right font-mono text-xs">{err.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== APM ==================== */}
        <TabsContent value="apm" className="flex flex-col gap-6">
          {/* APM Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {APM_STATS.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Response Time (ms)
              </CardTitle>
              <CardDescription>Rata-rata response time per jam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {RESPONSE_TIMES.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{item.label}</span>
                  <div className="flex-1">
                    <div className="h-5 w-full overflow-hidden rounded bg-muted">
                      <div
                        className="h-full rounded bg-primary transition-all"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-xs">{item.value}ms</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
