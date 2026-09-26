/**
 * Mock data untuk FinOps Dashboard.
 *
 * Dipisah dari `lib/mock-data.ts` karena后代 file ini grew >270 baris dan
 * hanya dipakai oleh 10 file di `app/(dashboard)/finops/` + 1 preset KPI.
 *
 * Struktur:
 *   - FINOPS_OVERVIEW           → ringkasan 30d (diturunkan dari trend)
 *   - MOCK_FINOPS_TREND         → 30 titik harian, stacked per kategori
 *   - MOCK_COST_BREAKDOWN       → per-project breakdown (tabel + kartu proyek)
 *   - MOCK_BUDGET_ALERTS        → alert aktif (RBAC-aware via projectId)
 *   - MOCK_RECOMMENDATIONS      → rekomendasi optimasi
 *   - MOCK_OPTIMIZED_PROJECTS   → proyek yang sudah efisien
 *
 * Belum ada backend. Semua nilai deterministik (tanpa `Math.random()` dan
 * tanpa `toLocaleDateString`, yang bisa berbeda antara Node dan browser
 * lalu memicu hydration mismatch).
 *
 * Invarian yang dijaga kode di bawah — jangan diubah manual:
 *   1. `FINOPS_OVERVIEW.totalCost` = Σ `MOCK_FINOPS_TREND[].total`
 *   2. `overview.<kategori>Cost`   = Σ `MOCK_FINOPS_TREND[].<kategori>`
 *   3. `projectId` di breakdown/alert/rekomendasi HARUS ada di
 *      `MOCK_PROJECTS` — kalau tidak, filter RBAC di `finops-client.tsx`
 *      membuang semua baris dan tabel jadi kosong.
 */

// ============================================================
//  Types
// ============================================================

export type CostCategory = "compute" | "storage" | "network" | "database"

export const COST_CATEGORIES: readonly CostCategory[] = [
  "compute",
  "storage",
  "network",
  "database",
] as const

export type AlertSeverity = "critical" | "warning" | "info"

export type BudgetStatus = "on-track" | "warning" | "over"

export interface FinOpsOverview {
  /** Total biaya 30 hari = Σ trend[].total */
  totalCost: number
  computeCost: number
  storageCost: number
  networkCost: number
  databaseCost: number
  budget: number
  /** Perubahan biaya vs periode sebelumnya, persen */
  trend: number
  cpuAvg: number
  cpuPeak: number
  storageUsedGb: number
  storageGrowthGb: number
  bandwidthGb: number
  egressGb: number
  dbQueriesM: number
  dbSlowQueries: number
}

export type CostTrendPoint = {
  /** Hari ke-N dalam periode 30 hari (1-based) */
  day: number
  /** Tanggal ISO (YYYY-MM-DD) */
  date: string
  /** Label sumbu ringkas, mis. "26 Sep" */
  label: string
  total: number
  compute: number
  storage: number
  network: number
  database: number
}

export interface ProjectCostBreakdown {
  projectId: string
  projectName: string
  /** Kategori dominan tim: Frontend / Backend / Data */
  team: string
  thisMonth: number
  lastMonth: number
  computeCost: number
  storageCost: number
  networkCost: number
  databaseCost: number
  /** Budget bulanan proyek. Tidak ada = proyek tidak dibatasi budget. */
  budget?: number
}

export interface OptimizationRecommendation {
  id: string
  projectId: string
  projectName: string
  impact: "high" | "medium"
  title: string
  currentDesc: string
  recommendedDesc: string
  /** Estimasi hemat bulanan (USD) */
  potentialSavings: number
  effort: "low" | "medium" | "high"
}

export interface OptimizedProject {
  projectId: string
  projectName: string
  note: string
}

export interface BudgetAlert {
  id: string
  /** `undefined` = alert org-wide, hanya ditampilkan untuk ADMIN */
  projectId?: string
  projectName?: string
  severity: AlertSeverity
  title: string
  description: string
  timeLabel: string
}

// ============================================================
//  Trend — 30 hari terakhir
// ============================================================

/** Singkatan bulan Indonesia — hardcoded, bukan `toLocaleDateString`. */
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const

/** Periode: 28 Agu – 26 Sep 2026 (30 hari, UTC). */
const TREND_START_UTC = Date.UTC(2026, 7, 28)

/** Total biaya 30 hari — dipakai sebagai target normalisasi trend. */
const TREND_TOTAL = 1404.7

/** Porsi tiap kategori terhadap total harian. */
const CATEGORY_SHARE: Record<CostCategory, number> = {
  compute: 0.521,
  storage: 0.238,
  network: 0.155,
  database: 0.086,
}

/**
 * Distribusi harian relatif terhadap rata-rata.
 *
 * Pola yang disimulasikan: naik bertahap sepanjang bulan, weekend turun
 * (index 5, 6, 12, 13, 19, 20), lonjakan trafik di index 24, dan
 *Maintenance di index 15.
 *
 * IMPORTANT: nilai ini dinormalisasi (bagi mean) saat dipakai supaya
 * Σ total = TREND_TOTAL. Tanpa normalisasi, Σ hanya 1318.53 — Overview
 * dan chart akan menampilkan total yang berbeda.
 */
const TREND_WEIGHTS = [
  0.82, 0.88, 0.91, 0.85, 0.79, 0.74, 0.78, // day 1–7
  0.92, 0.95, 0.98, 0.89, 0.84, 0.8, 0.86, // day 8–14
  0.98, 0.72, 1.02, 0.94, 0.88, 0.83, 0.91, // day 15–21 (maintenance di day 16)
  1.05, 1.08, 1.12, 1.31, 1.18, 1.09, 1.14, // day 22–28 (spike di day 25)
  1.02, 0.88, // day 29–30
] as const

const WEIGHT_MEAN =
  TREND_WEIGHTS.reduce((a, b) => a + b, 0) / TREND_WEIGHTS.length

const DAILY_AVG = TREND_TOTAL / TREND_WEIGHTS.length

function isoDate(offsetDays: number): string {
  return new Date(TREND_START_UTC + offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10)
}

function shortLabel(offsetDays: number): string {
  const d = new Date(TREND_START_UTC + offsetDays * 86_400_000)
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`
}

export const MOCK_FINOPS_TREND: CostTrendPoint[] = TREND_WEIGHTS.map(
  (weight, i) => {
    const total = Number((DAILY_AVG * (weight / WEIGHT_MEAN)).toFixed(2))
    return {
      day: i + 1,
      date: isoDate(i),
      label: shortLabel(i),
      total,
      compute: Number((total * CATEGORY_SHARE.compute).toFixed(2)),
      storage: Number((total * CATEGORY_SHARE.storage).toFixed(2)),
      network: Number((total * CATEGORY_SHARE.network).toFixed(2)),
      database: Number((total * CATEGORY_SHARE.database).toFixed(2)),
    }
  }
)

/** Overview dihitung dari trend supaya tidak mungkin melenceng dari chart. */
export const FINOPS_OVERVIEW: FinOpsOverview = (() => {
  const sum = (k: "total" | CostCategory) =>
    Number(MOCK_FINOPS_TREND.reduce((a, p) => a + p[k], 0).toFixed(2))
  return {
    totalCost: sum("total"),
    computeCost: sum("compute"),
    storageCost: sum("storage"),
    networkCost: sum("network"),
    databaseCost: sum("database"),
    budget: 1500,
    trend: 15.2,
    cpuAvg: 68,
    cpuPeak: 89,
    storageUsedGb: 342,
    storageGrowthGb: 12,
    bandwidthGb: 847,
    egressGb: 234,
    dbQueriesM: 2.4,
    dbSlowQueries: 12,
  }
})()

// ============================================================
//  Cost breakdown — per project
// ============================================================

export const MOCK_COST_BREAKDOWN: ProjectCostBreakdown[] = [
  {
    projectId: "proj-001",
    projectName: "E-Commerce Platform",
    team: "Backend",
    thisMonth: 423.18,
    lastMonth: 389.42,
    computeCost: 245,
    storageCost: 112,
    networkCost: 66,
    databaseCost: 46,
    budget: 500,
  },
  {
    projectId: "proj-002",
    projectName: "AI Chatbot",
    team: "Data",
    thisMonth: 312.47,
    lastMonth: 287.15,
    computeCost: 178,
    storageCost: 89,
    networkCost: 45,
    databaseCost: 34,
    budget: 400,
  },
  {
    projectId: "proj-003",
    projectName: "Portfolio Website",
    team: "Frontend",
    thisMonth: 87.31,
    lastMonth: 91.02,
    computeCost: 48,
    storageCost: 21,
    networkCost: 18,
    databaseCost: 8,
    budget: 100,
  },
  {
    projectId: "proj-004",
    projectName: "SaaS Dashboard",
    team: "Backend",
    thisMonth: 247.83,
    lastMonth: 198.27,
    computeCost: 134,
    storageCost: 78,
    networkCost: 36,
    databaseCost: 22,
    budget: 200,
  },
  {
    projectId: "proj-005",
    projectName: "Marketing Landing",
    team: "Frontend",
    thisMonth: 64.55,
    lastMonth: 58.9,
    computeCost: 32,
    storageCost: 18,
    networkCost: 14,
    databaseCost: 4,
  },
  {
    projectId: "proj-006",
    projectName: "Analytics API",
    team: "Data",
    thisMonth: 112.49,
    lastMonth: 96.33,
    computeCost: 66,
    storageCost: 24,
    networkCost: 22,
    databaseCost: 12,
    budget: 120,
  },
]

// ============================================================
//  Budget alerts
// ============================================================
//
// RBAC: `projectId: undefined` = alert org-wide → hanya untuk ADMIN.
// Alert dengan `projectId` difilter lewat `getMockProjectsByUser()`.
// ============================================================

export const MOCK_BUDGET_ALERTS: BudgetAlert[] = [
  {
    id: "alr-001",
    projectId: "proj-004",
    projectName: "SaaS Dashboard",
    severity: "critical",
    title: "Budget exceeded by $47.83",
    description:
      "123.9% of $200 budget · Auto-alert sent to data-team@omnistack.dev",
    timeLabel: "2 jam lalu",
  },
  {
    id: "alr-002",
    projectId: "proj-001",
    projectName: "E-Commerce Platform",
    severity: "warning",
    title: "Reached 85% of budget",
    description: "$423 of $500 · Projected to exceed by end of month",
    timeLabel: "6 jam lalu",
  },
  {
    id: "alr-003",
    projectId: "proj-002",
    projectName: "AI Chatbot",
    severity: "warning",
    title: "Reached 78% of budget",
    description: "$312 of $400 · On track to stay within budget",
    timeLabel: "1 hari lalu",
  },
  {
    id: "alr-004",
    projectId: "proj-004",
    projectName: "SaaS Dashboard",
    severity: "info",
    title: "Cost optimization recommendation available",
    description: "Potential savings: $124/month",
    timeLabel: "1 hari lalu",
  },
]

// ============================================================
//  Recommendations
// ============================================================

export const MOCK_RECOMMENDATIONS: OptimizationRecommendation[] = [
  {
    id: "rec-001",
    projectId: "proj-004",
    projectName: "SaaS Dashboard",
    impact: "high",
    title: "Downsize unused database instance",
    currentDesc: "db.r5.xlarge ($247/mo) · Utilization: 23% CPU, 31% Memory",
    recommendedDesc: "db.r5.large ($123/mo) · Last peak: 45% (30 days ago)",
    potentialSavings: 124,
    effort: "low",
  },
  {
    id: "rec-002",
    projectId: "proj-002",
    projectName: "AI Chatbot",
    impact: "high",
    title: "Enable auto-scaling during off-peak hours",
    currentDesc: "3 instances 24/7 ($312/mo) · 78% of requests during peak hours",
    recommendedDesc: "1 instance off-peak, 3 instances peak (6AM–10PM)",
    potentialSavings: 156,
    effort: "medium",
  },
  {
    id: "rec-003",
    projectId: "proj-001",
    projectName: "E-Commerce Platform",
    impact: "medium",
    title: "Switch to reserved instances (1-year term)",
    currentDesc: "On-demand ($423/mo) · Utilization: 94% (stable workload)",
    recommendedDesc: "Reserved ($338/mo) · Commitment: 1 year",
    potentialSavings: 85,
    effort: "low",
  },
]

export const MOCK_OPTIMIZED_PROJECTS: OptimizedProject[] = [
  {
    projectId: "proj-006",
    projectName: "Analytics API",
    note: "Good resource utilization (87% CPU, 72% Memory)",
  },
  {
    projectId: "proj-003",
    projectName: "Portfolio Website",
    note: "Efficient scaling (1–3 instances based on traffic)",
  },
]

// ============================================================
//  Helpers
// ============================================================

/** Total potensi penghematan bulanan dari semua rekomendasi. */
export const TOTAL_POTENTIAL_SAVINGS_MONTHLY = MOCK_RECOMMENDATIONS.reduce(
  (sum, r) => sum + r.potentialSavings,
  0
)

/**
 * Total penghematan tahunan. Diturunkan (bukan disimpan) supaya tidak
 * bisa melenceng dari `potentialSavings`.
 */
export const TOTAL_POTENTIAL_SAVINGS_YEARLY =
  TOTAL_POTENTIAL_SAVINGS_MONTHLY * 12

/** Status budget sebuah proyek. `undefined` bila proyek tanpa budget. */
export function getBudgetStatus(
  item: ProjectCostBreakdown
): BudgetStatus | undefined {
  if (!item.budget) return undefined
  const pct = item.thisMonth / item.budget
  if (pct >= 1) return "over"
  if (pct >= 0.75) return "warning"
  return "on-track"
}

export interface CategoryShare {
  category: CostCategory
  label: string
  value: number
  /** Persen dari total biaya kategori */
  pct: number
}

const CATEGORY_LABEL: Record<CostCategory, string> = {
  compute: "Compute",
  storage: "Storage",
  network: "Network",
  database: "Database",
}

/** Porsi biaya per kategori — untuk stacked bar, legend, atau donut. */
export function getCategoryShares(
  overview: FinOpsOverview = FINOPS_OVERVIEW
): CategoryShare[] {
  const values: Record<CostCategory, number> = {
    compute: overview.computeCost,
    storage: overview.storageCost,
    network: overview.networkCost,
    database: overview.databaseCost,
  }
  const total = COST_CATEGORIES.reduce((sum, c) => sum + values[c], 0)

  return COST_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    value: values[category],
    pct: total === 0 ? 0 : (values[category] / total) * 100,
  }))
}

export interface TrendStats {
  total: number
  avg: number
  peak: number
  peakDay: number
  low: number
  lowDay: number
}

/** Statistik ringkas trend — untuk caption di bawah chart. */
export function getTrendStats(
  trend: CostTrendPoint[] = MOCK_FINOPS_TREND
): TrendStats {
  if (trend.length === 0) {
    return { total: 0, avg: 0, peak: 0, peakDay: 0, low: 0, lowDay: 0 }
  }

  const totals = trend.map((p) => p.total)
  const peak = Math.max(...totals)
  const low = Math.min(...totals)

  return {
    total: Number(totals.reduce((s, v) => s + v, 0).toFixed(2)),
    avg: totals.reduce((s, v) => s + v, 0) / totals.length,
    peak,
    peakDay: trend.find((p) => p.total === peak)?.day ?? 0,
    low,
    lowDay: trend.find((p) => p.total === low)?.day ?? 0,
  }
}

export interface AlertsSummary {
  total: number
  critical: number
  warning: number
  info: number
}

/**
 * Ringkasan alert. WAJIB diberi daftar yang sudah difilter RBAC —
 * `MOCK_BUDGET_ALERTS` mentah berisi alert milik proyek user lain.
 */
export function summarizeAlerts(
  alerts: BudgetAlert[] = MOCK_BUDGET_ALERTS
): AlertsSummary {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  }
}
