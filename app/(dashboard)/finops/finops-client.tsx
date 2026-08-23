"use client"

import { useState } from "react"
import {
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  HardDrive,
  Lightbulb,
  Network,
  Server,
  TableIcon,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import {
  getMockProjectsByUser,
  type MockProject,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "FinOps Seluruh Sistem",
  USER: "FinOps Proyek Anda",
  VIEWER: "FinOps (Read-Only)",
}

const TREND_MONTHS = [
  { label: "Mar", cost: 148 },
  { label: "Apr", cost: 172 },
  { label: "Mei", cost: 165 },
  { label: "Jun", cost: 201 },
  { label: "Jul", cost: 224 },
  { label: "Agu", cost: 248 },
]

const PERIODE_OPTIONS = [
  { value: "bulan-ini", label: "Bulan Ini", disabled: false },
  { value: "bulan-lalu", label: "Bulan Lalu", disabled: true },
  { value: "kustom", label: "Rentang Kustom", disabled: true },
] as const

type PeriodeValue = (typeof PERIODE_OPTIONS)[number]["value"]

/** Nilai mock blueprint untuk ADMIN (seluruh sistem). */
const MOCK_TOTAL = 1247

const COST_CATEGORIES = [
  { key: "total", title: "Total", value: 1247, changePct: 15, icon: DollarSign },
  { key: "compute", title: "Compute", value: 687, changePct: 12, icon: Server },
  { key: "storage", title: "Storage", value: 342, changePct: 18, icon: HardDrive },
  { key: "network", title: "Network", value: 218, changePct: 22, icon: Network },
] as const

interface Recommendation {
  icon: typeof TriangleAlert
  tone: "warning" | "info" | "success"
  text: string
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    icon: TriangleAlert,
    tone: "warning",
    text: "Downsizing instance database yang kurang terpakai — hemat ~$45/bulan.",
  },
  {
    icon: Lightbulb,
    tone: "info",
    text: "Aktifkan auto-scaling di jam off-peak — hemat ~$30/bulan.",
  },
  {
    icon: CheckCircle2,
    tone: "success",
    text: "Utilisasi resource baik (92%) — pertahankan konfigurasi saat ini.",
  },
]

const TONE_CLASS: Record<Recommendation["tone"], string> = {
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
}

function estimateCost(deployments: number): number {
  return 12 + deployments * 2.5
}

/**
 * PRNG deterministik (LCG, seed tetap) — bukan Math.random() langsung,
 * agar nilai harian stabil antar render dan aman dari hydration mismatch.
 */
function seededDailyShape(days: number, seed: number): number[] {
  let state = seed
  const nextRand = (): number => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
  return Array.from({ length: days }, (_, i) => {
    const weekendBoost = i % 7 === 5 || i % 7 === 6 ? 0.3 : 0
    const wave = 0.5 * (1 + Math.sin((i / days) * Math.PI * 4))
    return 0.4 + nextRand() * 0.5 + weekendBoost + wave * 0.4
  })
}

const DAILY_SHAPE = seededDailyShape(30, 20260823)

interface ProjectCostRow {
  project: MockProject
  thisMonth: number
  lastMonth: number
  trendPct: number
}

export function FinOpsClient() {
  const { user } = useAuth()
  const [notice, setNotice] = useState("")
  const [periode, setPeriode] = useState<PeriodeValue>("bulan-ini")

  if (!user) return null

  const projects = getMockProjectsByUser(user.id, user.role)
  const costs: ProjectCostRow[] = projects.map((project) => {
    const thisMonth = estimateCost(project.deployments)
    const lastMonth = thisMonth * 0.9
    return {
      project,
      thisMonth,
      lastMonth,
      trendPct: ((thisMonth - lastMonth) / lastMonth) * 100,
    }
  })
  const userTotal = costs.reduce((sum, c) => sum + c.thisMonth, 0)
  const maxCost = Math.max(...costs.map((c) => c.thisMonth), 1)
  const maxTrend = Math.max(...TREND_MONTHS.map((m) => m.cost))

  // Penskalaan Cost Overview: ADMIN melihat angka mock penuh blueprint;
  // USER/VIEWER diskalakan proporsional terhadap total estimasi proyeknya.
  const overviewScale =
    user.role === "ADMIN" ? 1 : Math.min(userTotal / MOCK_TOTAL, 1)
  const dailySum = DAILY_SHAPE.reduce((sum, v) => sum + v, 0)
  const dailyValues = DAILY_SHAPE.map(
    (v) => (v / dailySum) * (userTotal > 0 ? userTotal : MOCK_TOTAL)
  )
  const dailyAvg = userTotal / 30
  const peakDay = dailyValues.indexOf(Math.max(...dailyValues)) + 1
  const peakValue = Math.max(...dailyValues)
  const maxDaily = Math.max(...dailyValues, 1)

  const handleExport = (format: "pdf" | "csv") => {
    setNotice(`Export ${format.toUpperCase()} disiapkan (mock)`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {TITLE_BY_ROLE[user.role]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pantau biaya infrastruktur per proyek dan bandingkan dengan provider
          lain.
        </p>
      </div>

      {/* Bar kontrol */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={periode}
          onValueChange={(v) => setPeriode(v as PeriodeValue)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Periode laporan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
                {opt.disabled ? " (segera)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            )}
          >
            <Download className="size-4" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 size-4" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <TableIcon className="mr-2 size-4" />
              Export CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cost Overview */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Cost Overview (Agustus 2026)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COST_CATEGORIES.map((cat) => (
            <Card key={cat.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cat.title}</CardTitle>
                <cat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round(cat.value * overviewScale).toLocaleString("en-US")}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  ↑{cat.changePct}% vs Juli
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {user.role !== "ADMIN" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Angka diskalakan proporsional dari estimasi proyek Anda.
          </p>
        )}
      </div>

      {/* Cost Breakdown by Project */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Project</CardTitle>
          <CardDescription>
            Biaya bulan ini vs bulan lalu berdasarkan jumlah deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada proyek yang dapat dipantau.
            </p>
          ) : (
            costs.map(({ project, thisMonth, lastMonth, trendPct }) => (
              <div key={project.id} className="space-y-1.5">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-x-4 text-sm">
                  <span className="truncate font-medium">{project.name}</span>
                  <span className="font-mono tabular-nums">
                    ${thisMonth.toFixed(0)}
                  </span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    ${lastMonth.toFixed(0)}
                  </span>
                  <span className="text-xs text-destructive">
                    ↑{trendPct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(thisMonth / maxCost) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Daily Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend (30 Hari)</CardTitle>
          <CardDescription>
            Rata-rata: ${dailyAvg.toFixed(2)}/hari · Puncak: $
            {peakValue.toFixed(2)} (hari ke-{peakDay})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-1">
            {dailyValues.map((value, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-t-sm",
                  value === peakValue ? "bg-primary" : "bg-primary/40"
                )}
                style={{ height: `${Math.max((value / maxDaily) * 100, 4)}%` }}
                aria-label={`Hari ${index + 1}: $${value.toFixed(2)}`}
                role="img"
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>1 Agu</span>
            <span>15 Agu</span>
            <span>30 Agu</span>
          </div>
        </CardContent>
      </Card>

      {/* Rekomendasi Optimasi */}
      <Card>
        <CardHeader>
          <CardTitle>Rekomendasi Optimasi Biaya</CardTitle>
          <CardDescription>Saran penghematan berbasis pola usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {RECOMMENDATIONS.map((rec) => (
            <div key={rec.text} className="flex items-start gap-3">
              <rec.icon className={cn("mt-0.5 size-4 shrink-0", TONE_CLASS[rec.tone])} />
              <p className="text-sm text-foreground">{rec.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tren biaya 6 bulan */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Biaya 6 Bulan</CardTitle>
          <CardDescription>Total biaya Mar hingga Agu 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-3">
            {TREND_MONTHS.map((month) => {
              const isHighest = month.cost === maxTrend
              return (
                <div
                  key={month.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-md",
                        isHighest ? "bg-primary" : "bg-primary/40"
                      )}
                      style={{
                        height: `${(month.cost / maxTrend) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {month.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export bawah */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 size-4" />
          Export Report (PDF)
        </Button>
        <Button variant="outline" onClick={() => handleExport("csv")}>
          <TableIcon className="mr-2 size-4" />
          Export Data (CSV)
        </Button>
      </div>
      {notice && (
        <p className="text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      )}
    </div>
  )
}
