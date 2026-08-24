# AI Code Reviewer Page — Implementation Plan

> **Status:** Draft
> **Date:** 2026-08-23
> **Based on:** `qwen-result.txt` blueprint + AI Council consensus (5 reviewers)
> **Route:** `/ai-reviewer` — `app/(dashboard)/ai-reviewer/`
> **Stack:** Next.js 16 App Router + TypeScript strict + Tailwind v4 + shadcn/ui (Base UI, NO asChild)

---

## 1. Konsensus AI Council

| Anggota | Verdict |
|---------|---------|
| UI/UX Reviewer | Blueprint premature enterprise — konsolidasi dulu, wizard 3-step over-engineered |
| Frontend Architect | ~15 file komponen, state FSM via useReducer, semua client (localStorage auth) |
| **Security Architect** | **4 dari 6 SSDF practice salah nomor** — compliance theater, fix mapping dulu |
| MVP Pragmatist | Build Results + Finding Drawer dulu — ini *is* the product |
| Code Quality Reviewer | 18+ hard-coded colors, `cn()` tidak dipakai — fix sebelum build baru |

**Kesepakatan:** Implement v1 = Dashboard + Results + Finding Drawer. Wizard, Live Scan, SSDF Matrix, Settings = v2.

---

## 2. v1 Scope & Cut List

### Build v1 (sekarang)

| View | Estimasi | Alasan |
|------|----------|--------|
| Results (tabbed) | Large | Core product — tanpa findings, tidak ada yang bisa dijual |
| Finding Detail drawer | Small | Reuse data View 4, high leverage, "AI-powered security" sell point |
| Dashboard | Medium | Landing page standar, pattern Card+Table sudah ada di `projects/` |

### Cut ke v2

| View | Alasan |
|------|--------|
| Wizard 3-step | Over-engineered — konsolidasi jadi single page nanti |
| Live Scan | Async state machine + streaming mock — pure theater di mock-only stage |
| SSDF Matrix | **Harus fix mapping ke SP 800-218 v1.1** sebelum implement |
| Admin Settings | Zero user value MVP, copy pattern dari `admin/settings/` |

---

## 3. File Structure (Final)

```
app/(dashboard)/ai-reviewer/
├── page.tsx                          # RouteGuard + metadata — SIMPAN yang ada
├── ai-reviewer-client.tsx            # ← DELETE, ganti review-shell.tsx
├── _components/
│   ├── types.ts                      # Review, Finding, SecurityPosture, Severity enums
│   ├── review-shell.tsx              # "use client" — view FSM + top-level layout
│   ├── mock-data-reviewer.ts         # Mock data khusus reviewer (isolasi dari lib/mock-data.ts)
│   │
│   ├── dashboard/
│   │   ├── security-posture-banner.tsx   # Postur score 0-100 + progress bar + last scan
│   │   ├── stats-grid.tsx                # 4 stat cards: Total Reviews, Open, Critical, Fixed
│   │   └── recent-reviews-table.tsx      # Table 5 baris terbaru — reuse pattern projects-table.tsx
│   │
│   ├── results/
│   │   ├── results-header.tsx            # Repo name + PR + Score badge + Status badge + meta
│   │   ├── results-tabs.tsx              # Tabs: Overview | Security (N) | Code Quality
│   │   ├── overview-tab.tsx              # Severity breakdown grid + summary stats
│   │   ├── findings-list.tsx             # Filterable findings cards — core deliverable
│   │   └── findings-filters.tsx          # Severity select + CWE select + search Input
│   │
│   ├── finding-detail-sheet.tsx          # Side drawer: CWE + CVSS + code snippet + fix + actions
│   │
│   └── shared/
│       ├── severity-badge.tsx            # 5-level badge: Critical/High/Med/Low/Info + color
│       └── score-badge.tsx               # 0-100 score + semantic color + trend arrow
```

**Total: 14 file baru** (mengganti 1 file lama `ai-reviewer-client.tsx`).

---

## 4. Types & Mock Data

### 4.1 `_components/types.ts`

```typescript
export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info"

export type ReviewStatus = "passed" | "failed" | "running" | "pending"

export type ReviewProfile = "standard" | "deep" | "quick"

export type FindingStatus = "open" | "fixed" | "false_positive"

export interface Review {
  id: string
  repo: string
  pr: {
    number: number
    branch: string
    title: string
  }
  score: number // 0-100
  status: ReviewStatus
  severity: Record<Severity, number> // counts per level
  profile: ReviewProfile
  filesChanged: number
  linesAdded: number
  linesRemoved: number
  scannedAt: string // ISO 8601
}

export interface Finding {
  id: string
  reviewId: string
  severity: Severity
  cwe: string // e.g. "CWE-287"
  owasp: string // e.g. "A01:2021"
  ssdfPractice: string // e.g. "PW.6" (FIXED — see NIST SSDF section)
  file: string
  line: number
  column?: number
  message: string // human-readable finding title
  explanation: string // "Why this is dangerous"
  fixSuggestion: string // AI-generated recommended fix code
  cvss: number // 0-10
  status: FindingStatus
}

export interface SecurityPosture {
  score: number
  openCriticals: number
  lastScan: string // ISO 8601
  nextScheduled: string // e.g. "daily 02:00 UTC"
}

export interface ReviewStats {
  totalReviews: number
  openFindings: number
  criticalAndHigh: number
  fixedThisWeek: number
  trends: {
    totalReviews: number // % change
    openFindings: number
    criticalAndHigh: number
    fixedThisWeek: number
  }
}
```

### 4.2 `_components/mock-data-reviewer.ts`

```typescript
import type { Review, Finding, SecurityPosture, ReviewStats } from "./types"

export const MOCK_POSTURE: SecurityPosture = {
  score: 82,
  openCriticals: 3,
  lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  nextScheduled: "daily 02:00 UTC",
}

export const MOCK_STATS: ReviewStats = {
  totalReviews: 148,
  openFindings: 23,
  criticalAndHigh: 7,
  fixedThisWeek: 41,
  trends: {
    totalReviews: 12,
    openFindings: -8,
    criticalAndHigh: 2,
    fixedThisWeek: 23,
  },
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    repo: "api-gateway",
    pr: { number: 142, branch: "feat/auth", title: "Add JWT middleware" },
    score: 61,
    status: "failed",
    severity: { Critical: 4, High: 3, Medium: 8, Low: 5, Info: 3 },
    profile: "standard",
    filesChanged: 14,
    linesAdded: 320,
    linesRemoved: 88,
    scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev-002",
    repo: "web-frontend",
    pr: { number: 141, branch: "hotfix/xss", title: "Sanitize user input" },
    score: 94,
    status: "passed",
    severity: { Critical: 0, High: 0, Medium: 1, Low: 2, Info: 1 },
    profile: "standard",
    filesChanged: 3,
    linesAdded: 45,
    linesRemoved: 12,
    scannedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev-003",
    repo: "payment-svc",
    pr: { number: 140, branch: "release/2.1", title: "Refactor checkout flow" },
    score: 78,
    status: "failed",
    severity: { Critical: 0, High: 1, Medium: 4, Low: 3, Info: 2 },
    profile: "deep",
    filesChanged: 8,
    linesAdded: 180,
    linesRemoved: 95,
    scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev-004",
    repo: "auth-service",
    pr: { number: 139, branch: "main", title: "Bump dependencies" },
    score: 88,
    status: "passed",
    severity: { Critical: 0, High: 0, Medium: 2, Low: 4, Info: 5 },
    profile: "quick",
    filesChanged: 2,
    linesAdded: 12,
    linesRemoved: 12,
    scannedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  // + 4-5 more reviews for realistic table
]

export const MOCK_FINDINGS: Finding[] = [
  // --- rev-001 (api-gateway, score 61) ---
  {
    id: "f-001",
    reviewId: "rev-001",
    severity: "Critical",
    cwe: "CWE-287",
    owasp: "A01:2021",
    ssdfPractice: "PW.6",
    file: "src/middleware/auth.ts",
    line: 42,
    message: "JWT signature tidak diverifikasi sebelum grant access",
    explanation: "jwt.decode() tanpa verify memungkinkan attacker membuat token palsu dengan role 'admin' → full access bypass.",
    fixSuggestion: "const payload = await jwt.verify(token, SECRET)\n// + tambah signature check & expiry validation",
    cvss: 9.1,
    status: "open",
  },
  {
    id: "f-002",
    reviewId: "rev-001",
    severity: "Critical",
    cwe: "CWE-89",
    owasp: "A03:2021",
    ssdfPractice: "PW.4",
    file: "src/db/query.ts",
    line: 118,
    message: "SQL Injection — string concatenation pada query SQL dengan input user",
    explanation: "Input user langsung di-concat ke SQL string tanpa parameterization → attacker bisa execute arbitrary SQL.",
    fixSuggestion: "const result = await db.query(\n  'SELECT * FROM users WHERE id = $1',\n  [userId]\n)",
    cvss: 9.8,
    status: "open",
  },
  {
    id: "f-003",
    reviewId: "rev-001",
    severity: "High",
    cwe: "CWE-79",
    owasp: "A03:2021",
    ssdfPractice: "PW.4",
    file: "src/components/Comment.tsx",
    line: 67,
    message: "Cross-site Scripting (XSS) — dangerouslySetInnerHTML dengan unsanitized input",
    explanation: "User input dirender langsung sebagai HTML tanpa sanitization → attacker bisa inject malicious scripts.",
    fixSuggestion: "import DOMPurify from 'dompurify'\nconst clean = DOMPurify.sanitize(userInput)\n<div dangerouslySetInnerHTML={{ __html: clean }} />",
    cvss: 7.5,
    status: "open",
  },
  {
    id: "f-004",
    reviewId: "rev-001",
    severity: "High",
    cwe: "CWE-22",
    owasp: "A01:2021",
    ssdfPractice: "PW.6",
    file: "src/utils/file.ts",
    line: 23,
    message: "Path Traversal — user input langsung digunakan untuk resolve file path",
    explanation: "Attacker bisa操纵 path untuk mengakses file di luar direktori yang diizinkan (e.g. ../../etc/passwd).",
    fixSuggestion: "import path from 'path'\nconst safePath = path.resolve(baseDir, path.normalize(userInput))\nif (!safePath.startsWith(baseDir)) throw new Error('Invalid path')",
    cvss: 7.5,
    status: "open",
  },
  // ... 10+ more findings across Medium/Low/Info
]

// Helper functions
export function getReviews(): Review[] {
  return MOCK_REVIEWS
}

export function getReviewById(id: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.id === id)
}

export function getFindingsByReview(reviewId: string): Finding[] {
  return MOCK_FINDINGS.filter((f) => f.reviewId === reviewId)
}

export function getPosture(): SecurityPosture {
  return MOCK_POSTURE
}

export function getStats(): ReviewStats {
  return MOCK_STATS
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-500"
  if (score >= 80) return "text-yellow-500"
  if (score >= 60) return "text-orange-500"
  return "text-red-500"
}

export function getSeverityConfig(severity: Severity) {
  const map = {
    Critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
    High: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    Low: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Info: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" },
  } as const
  return map[severity]
}

export function getStatusConfig(status: ReviewStatus) {
  const map = {
    passed: { label: "Passed", color: "text-green-500", icon: "✓" },
    failed: { label: "Failed", color: "text-red-500", icon: "✕" },
    running: { label: "Running", color: "text-blue-500", icon: "◉" },
    pending: { label: "Pending", color: "text-muted-foreground", icon: "○" },
  } as const
  return map[status]
}
```

---

## 5. Component Specifications

### 5.1 `page.tsx` (KEEP — minimal change)

```typescript
import { RouteGuard } from "@/components/route-guard"
import { ReviewShell } from "./_components/review-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Code Reviewer - OmniStack",
  description: "AI-powered code review with NIST SSDF security analysis",
}

export default function AiReviewerPage() {
  return (
    <RouteGuard requiredRole="USER">
      <ReviewShell />
    </RouteGuard>
  )
}
```

### 5.2 `_components/review-shell.tsx` — View FSM

```typescript
"use client"

import { useReducer } from "react"
import { DashboardView } from "./dashboard/dashboard-view"
import { ResultsView } from "./results/results-view"
import { FindingDetailSheet } from "./finding-detail-sheet"
import type { Review, Finding } from "./types"

// --- FSM Types ---
type ViewState =
  | { view: "dashboard" }
  | { view: "results"; reviewId: string }
  | { view: "finding"; reviewId: string; findingId: string }

type ViewAction =
  | { type: "SELECT_REVIEW"; reviewId: string }
  | { type: "SELECT_FINDING"; findingId: string }
  | { type: "GO_BACK" }
  | { type: "GO_DASHBOARD" }

// --- Reducer ---
function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SELECT_REVIEW":
      return { view: "results", reviewId: action.reviewId }
    case "SELECT_FINDING":
      if (state.view !== "results") return state
      return { view: "finding", reviewId: state.reviewId, findingId: action.findingId }
    case "GO_BACK":
      if (state.view === "finding") return { view: "results", reviewId: state.reviewId }
      if (state.view === "results") return { view: "dashboard" }
      return state
    case "GO_DASHBOARD":
      return { view: "dashboard" }
  }
}

// --- Shell ---
export function ReviewShell() {
  const [state, dispatch] = useReducer(viewReducer, { view: "dashboard" })

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation (when not on dashboard) */}
      {state.view !== "dashboard" && (
        <button onClick={() => dispatch({ type: "GO_BACK" })} className="...">
          ← Back to {state.view === "finding" ? "results" : "reviews"}
        </button>
      )}

      {/* View rendering */}
      {state.view === "dashboard" && (
        <DashboardView onSelectReview={(id) => dispatch({ type: "SELECT_REVIEW", reviewId: id })} />
      )}

      {state.view === "results" && (
        <ResultsView
          reviewId={state.reviewId}
          onSelectFinding={(id) => dispatch({ type: "SELECT_FINDING", findingId: id })}
        />
      )}

      {state.view === "finding" && (
        <FindingDetailSheet
          reviewId={state.reviewId}
          findingId={state.findingId}
          onClose={() => dispatch({ type: "GO_BACK" })}
        />
      )}
    </div>
  )
}
```

### 5.3 `dashboard/dashboard-view.tsx`

Props: `{ onSelectReview: (id: string) => void }`

Renders:
1. **Header** — `<Brain>` icon + title "AI Code Reviewer" + subtitle
2. **SecurityPostureBanner** — score 0-100, progress bar, open criticals, last scan
3. **StatsGrid** — 4 Card components in grid (Total Reviews, Open Findings, Critical & High, Fixed this week) — each with trend arrow
4. **RecentReviewsTable** — table of 5 most recent reviews, each row clickable → `onSelectReview`

Pattern: Follow `app/(dashboard)/projects/project-list.tsx` structure (client wrapper + Card + grid).

### 5.4 `dashboard/security-posture-banner.tsx`

Props: `{ posture: SecurityPosture }`

```tsx
<Card className="border-primary/20 bg-primary/5">
  <CardContent className="flex items-center gap-6 p-4">
    {/* Score circle */}
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r="28" className="stroke-muted" strokeWidth="4" fill="none" />
        <circle cx="32" cy="32" r="28" className={cn("stroke-current", getScoreColor(posture.score))}
          strokeWidth="4" fill="none"
          strokeDasharray={`${(posture.score / 100) * 175.9} 175.9`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {posture.score}
      </span>
    </div>

    {/* Info */}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Security Posture</h3>
        <Badge variant="outline" className="text-xs">NIST SSDF</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {posture.openCriticals} open criticals · Last scan: {formatTimeAgo(posture.lastScan)}
      </p>
    </div>

    {/* Progress bar */}
    <div className="hidden w-48 md:block">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", getScoreColor(posture.score))}
          style={{ width: `${posture.score}%` }} />
      </div>
    </div>
  </CardContent>
</Card>
```

### 5.5 `dashboard/stats-grid.tsx`

Props: `{ stats: ReviewStats }`

4 Cards dalam `grid grid-cols-2 lg:grid-cols-4 gap-4`:
- Total Reviews: `stats.totalReviews` + trend `+${stats.trends.totalReviews}% ▲`
- Open Findings: `stats.openFindings` + trend `${stats.trends.openFindings}% ▼`
- Critical & High: `stats.criticalAndHigh` + trend icon
- Fixed this week: `stats.fixedThisWeek` + trend icon

Trend hijau = positif (fixed naik), merah = negatif (critical naik). Gunakan `cn()` untuk conditional color.

### 5.6 `dashboard/recent-reviews-table.tsx`

Props: `{ reviews: Review[], onSelectReview: (id: string) => void }`

Table pattern dari `projects-table.tsx`:
```
| Repo | PR | Branch | Score | Status | Files | Time |
```
Setiap row clickable → `onSelectReview(review.id)`.
Score pakai `ScoreBadge`, Status pakai `Badge` dengan `getStatusConfig()`.

### 5.7 `results/results-view.tsx`

Props: `{ reviewId: string, onSelectFinding: (id: string) => void }`

Renders:
1. **ResultsHeader** — repo name, PR info, score badge, status badge, meta (files changed, lines, profile)
2. **ResultsTabs** — shadcn Tabs: Overview | Security (N) | Code Quality

### 5.8 `results/results-header.tsx`

Props: `{ review: Review }`

```tsx
<div className="flex flex-wrap items-center gap-4">
  <h2 className="text-2xl font-bold">{review.repo}</h2>
  <Badge variant="outline">PR #{review.pr.number}</Badge>
  <Badge variant="outline">{review.pr.branch}</Badge>
  <ScoreBadge score={review.score} />
  <StatusBadge status={review.status} />
  <span className="ml-auto text-sm text-muted-foreground">
    {review.filesChanged} files · +{review.linesAdded}/-{review.linesRemoved} · {review.profile}
  </span>
</div>
```

### 5.9 `results/results-tabs.tsx`

Props: `{ review: Review, findings: Finding[], onSelectFinding: (id: string) => void }`

```tsx
<Tabs defaultValue="security">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="security">
      Security ({review.severity.Critical + review.severity.High})
      {(review.severity.Critical > 0) && <span className="ml-1 text-destructive">🔴</span>}
    </TabsTrigger>
    <TabsTrigger value="quality">Code Quality</TabsTrigger>
  </TabsList>
  <TabsContent value="overview"><OverviewTab review={review} /></TabsContent>
  <TabsContent value="security">
    <FindingsFilters onFilterChange={...} />
    <FindingsList findings={filteredFindings} onSelectFinding={onSelectFinding} />
  </TabsContent>
  <TabsContent value="quality"><div>Coming in v2</div></TabsContent>
</Tabs>
```

### 5.10 `results/findings-list.tsx` (CORE DELIVERABLE)

Props: `{ findings: Finding[], onSelectFinding: (id: string) => void }`

Setiap finding card:
```
┌──────────────────────────────────────────────────────────────┐
│ 🔴 CRITICAL  CWE-287 · Improper Authentication              │
│ src/middleware/auth.ts:42                                    │
│ JWT signature tidak diverifikasi sebelum grant access       │
│ SSDF: PW.6 · OWASP: A01 · CVSS: 9.1   [View Detail →]     │
└──────────────────────────────────────────────────────────────┘
```

- Icon + Badge severity
- CWE ID + title
- File path + line number
- Message (ringkas)
- Triple mapping footer: SSDF + OWASP + CVSS
- Button "View Detail" → `onSelectFinding(finding.id)`

Sorted by: Critical > High > Medium > Low > Info, lalu by CVSS descending.

### 5.11 `results/findings-filters.tsx`

State: `{ severity: Severity | "all", search: string }`

```tsx
<div className="flex flex-wrap items-center gap-3">
  <Select value={severity} onValueChange={setSeverity}>
    <SelectTrigger className="w-[140px]">
      <SelectValue placeholder="All Severities" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="Critical">🔴 Critical</SelectItem>
      <SelectItem value="High">🟠 High</SelectItem>
      <SelectItem value="Medium">🟡 Medium</SelectItem>
      <SelectItem value="Low">🔵 Low</SelectItem>
      <SelectItem value="Info">⚪ Info</SelectItem>
    </SelectContent>
  </Select>
  <Input placeholder="Search findings..." value={search} onChange={...} className="w-[240px]" />
</div>
```

### 5.12 `finding-detail-sheet.tsx` (HIGH LEVERAGE)

Props: `{ reviewId: string, findingId: string, onClose: () => void }`

```tsx
<Sheet open onOpenChange={onClose}>
  <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
    <SheetHeader>
      <SheetTitle className="flex items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        {finding.cwe} · {finding.message}
      </SheetTitle>
    </SheetHeader>

    {/* File location */}
    <div className="mt-4 text-sm text-muted-foreground">
      {finding.file}:{finding.line}
    </div>

    {/* Mappings */}
    <Card className="mt-4">
      <CardContent className="grid grid-cols-2 gap-2 p-4 text-sm">
        <div><span className="text-muted-foreground">NIST SSDF:</span> {finding.ssdfPractice}</div>
        <div><span className="text-muted-foreground">OWASP:</span> {finding.owasp}</div>
        <div><span className="text-muted-foreground">CWE:</span> {finding.cwe}</div>
        <div><span className="text-muted-foreground">CVSS:</span> <span className={cn(
          "font-bold", finding.cvss >= 9 && "text-destructive",
          finding.cvss >= 7 && finding.cvss < 9 && "text-orange-500"
        )}>{finding.cvss}</span></div>
      </CardContent>
    </Card>

    {/* Explanation */}
    <div className="mt-4">
      <h4 className="text-sm font-semibold">Why this is dangerous</h4>
      <p className="mt-1 text-sm text-muted-foreground">{finding.explanation}</p>
    </div>

    {/* Fix suggestion */}
    <div className="mt-4">
      <h4 className="text-sm font-semibold">Recommended Fix</h4>
      <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted p-3 font-mono text-xs">
        {finding.fixSuggestion}
      </pre>
    </div>

    {/* Actions */}
    <div className="mt-6 flex gap-2">
      <Button size="sm">Apply AI Fix</Button>
      <Button size="sm" variant="outline">Mark False Positive</Button>
    </div>
  </SheetContent>
</Sheet>
```

### 5.13 `shared/severity-badge.tsx`

```typescript
import { cn } from "@/lib/utils"
import { getSeverityConfig } from "../mock-data-reviewer"
import type { Severity } from "../types"

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = getSeverityConfig(severity)
  return (
    <Badge variant="outline" className={cn("text-xs font-mono", config.color, config.bg, className)}>
      {severity}
    </Badge>
  )
}
```

### 5.14 `shared/score-badge.tsx`

```typescript
import { cn } from "@/lib/utils"
import { getScoreColor } from "../mock-data-reviewer"

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <Badge variant="outline" className={cn("text-sm font-bold", getScoreColor(score), className)}>
      {score}/100
    </Badge>
  )
}
```

---

## 6. State Architecture

```
review-shell.tsx (root)
├── useReducer<ViewState, ViewAction>  ← FSM: dashboard | results | finding
├── Di pass ke children via props (bukan context — simple enough)
│
├── dashboard-view.tsx
│   └── (no local state — pure props rendering)
│
├── results-view.tsx
│   └── results-tabs.tsx
│       ├── useState<severity filter>   ← local
│       ├── useState<search string>     ← local
│       └── useMemo<filtered findings>  ← derived from filter + search
│
└── finding-detail-sheet.tsx
    └── (no local state — Sheet open controlled by parent via view FSM)
```

**Kenapa bukan Context/Zustand:**
- 3 view, 4 action — reducer saja cukup
- Semua data dari mock functions (tidak perlu async/fetch)
- Local state di children (filter, search) tidak perlu di-share

---

## 7. UI Component Reuse

| Component | Import Path | Usage |
|-----------|-------------|-------|
| `Badge` | `@/components/ui/badge` | Severity, status, profile, score badges |
| `Card`, `CardContent`, `CardHeader`, `CardTitle` | `@/components/ui/card` | Dashboard stats, posture banner, finding cards |
| `Button` | `@/components/ui/button` | Actions: Apply Fix, Mark FP, Back, View Detail |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/components/ui/tabs` | Results view tab switching |
| `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` | `@/components/ui/sheet` | Finding detail drawer |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | `@/components/ui/select` | Severity filter |
| `Input` | `@/components/ui/input` | Search findings |
| `Skeleton` | `@/components/ui/skeleton` | Loading states (Phase 3) |
| `Separator` | `@/components/ui/separator` | Visual dividers |

**JANGAN EDIT** file di `components/ui/`. Semua import dari sana.

---

## 8. RBAC

| Mechanism | Implementation | Status |
|-----------|---------------|--------|
| Page guard | `RouteGuard requiredRole="USER"` di `page.tsx:6` | ✅ Sudah ada |
| Sidebar visibility | `user.role !== "VIEWER"` guard di `app-sidebar.tsx:88-111` | ✅ Sudah ada |
| Direct URL access | VIEWER `/ai-reviewer` → redirect + toast via RouteGuard | ✅ Sudah ada |
| Admin settings | `roleAtLeast(role, "ADMIN")` — deferred v2 | ⏳ v2 |

---

## 9. NIST SSDF Fix (Before Any SSDF UI)

### Mapping SALAH di Blueprint `qwen-result.txt`

| Blueprint | Seharusnya (SP 800-218 v1.1) |
|-----------|-------------------------------|
| PW.4 = "Review & analyze code" | **PW.6** — Review and/or analyze human-readable source code |
| PW.5 = "Test executable code" | **PW.7** — Test executable code |
| PW.1 = "Reuse secure components" | **PW.3** — Reuse existing, well-secured software |
| PW.7 = "Secure config" | **PW.8** — Configure software to have secure settings by default |

### Mapping BENAR yang dipakai di v1

| Practice | Deskripsi | UI |
|----------|-----------|-----|
| PS.1 | Protect all forms of source code | (v2: secrets scan badge) |
| PS.3 | Protect software integrity | (v2: dependency check badge) |
| PW.3 | Reuse existing, well-secured software | (v2: known-vuln detection) |
| PW.4 | Create source code by adhering to secure coding practices | SAST findings |
| PW.6 | Review and/or analyze human-readable source code | Code review results |
| PW.8 | Configure software to have secure settings by default | (v2: security gate defaults) |
| RV.1 | Identify and confirm vulnerabilities | (v2: continuous monitoring) |

**Rule:** Jangan referensi SSDF practice di UI v1 kecuali mapping sudah verified.

---

## 10. Responsive Design

| Breakpoint | Dashboard | Results | Finding Drawer |
|------------|-----------|---------|----------------|
| ≥1280px (desktop) | Grid 2-col: sidebar + table | Full width, tabs | Sheet 480px right |
| 768–1279px (tablet) | Stack vertically | Tabs horizontal scroll | Sheet full width |
| <768px (mobile) | Stack, stats 2-col | Tabs scroll | Full-screen sheet |

Pattern: `lg:grid-cols-*` untuk desktop, `grid-cols-1 md:grid-cols-2` untuk stats.

---

## 11. Color Semantics

| Token | Usage | JANGAN |
|-------|-------|--------|
| `text-destructive` | Critical findings, failed status | ~~`text-red-500`~~ |
| `bg-destructive/10` | Critical badge background | ~~`bg-red-500/10`~~ |
| `text-orange-500` | High findings | — |
| `bg-orange-500/10` | High badge background | — |
| `text-yellow-500` | Medium findings | — |
| `text-blue-500` | Low findings | — |
| `text-muted-foreground` | Info findings, secondary text | ~~`text-zinc-500`~~ |
| `bg-background` / `text-foreground` | Page defaults | ~~`bg-white`/`bg-zinc-950`~~ |
| `bg-muted` | Cards, secondary backgrounds | ~~`bg-zinc-900`~~ |
| `border-border` | All borders | ~~`border-zinc-800`~~ |

---

## 12. Execution Order

### Phase 1: Foundation

| Task | File | Estimasi | Dependencies |
|------|------|----------|-------------|
| 1.1 Fix existing code quality | `ai-reviewer-client.tsx` → delete | 0 | — |
| 1.2 Create types | `_components/types.ts` | 15 min | — |
| 1.3 Create mock data | `_components/mock-data-reviewer.ts` | 30 min | Task 1.2 |
| 1.4 Create shared components | `shared/severity-badge.tsx`, `shared/score-badge.tsx` | 20 min | Task 1.2 |

### Phase 2: Core Views

| Task | File | Estimasi | Dependencies |
|------|------|----------|-------------|
| 2.1 View FSM shell | `review-shell.tsx` | 30 min | Task 1.2 |
| 2.2 Dashboard view | `dashboard/dashboard-view.tsx` | 45 min | Task 1.3, 1.4 |
| 2.3 Security posture banner | `dashboard/security-posture-banner.tsx` | 20 min | Task 1.4 |
| 2.4 Stats grid | `dashboard/stats-grid.tsx` | 20 min | Task 1.4 |
| 2.5 Recent reviews table | `dashboard/recent-reviews-table.tsx` | 25 min | Task 1.3, 1.4 |
| 2.6 Results header | `results/results-header.tsx` | 15 min | Task 1.3, 1.4 |
| 2.7 Results tabs | `results/results-tabs.tsx` | 30 min | Task 2.6 |
| 2.8 Findings list | `results/findings-list.tsx` | 40 min | Task 1.3, 1.4 |
| 2.9 Findings filters | `results/findings-filters.tsx` | 20 min | Task 1.3 |
| 2.10 Overview tab | `results/overview-tab.tsx` | 20 min | Task 1.3 |
| 2.11 Finding detail sheet | `finding-detail-sheet.tsx` | 35 min | Task 1.3, 1.4 |

### Phase 3: Polish

| Task | File | Estimasi | Dependencies |
|------|------|----------|-------------|
| 3.1 Loading skeletons | All view components | 30 min | Phase 2 selesai |
| 3.2 Empty states | `review-shell.tsx` | 15 min | Phase 2 selesai |
| 3.3 Responsive fixes | All components | 30 min | Phase 2 selesai |
| 3.4 Quality gate | — | 15 min | Semua selesai |

**Total estimasi: ~5.5 jam** (14 file baru, 1 file dihapus)

---

## 13. Known Risks

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | SSDF mapping salah di blueprint | Fix mapping sebelum implement SSDF tab (v2) |
| 2 | Live scan async timer complex | Defer ke v2, gunakan `useReviewSimulation` hook |
| 3 | All client components (localStorage auth) | Accept — server components tidak bisa dipakai sampai backend |
| 4 | 18+ hard-coded colors di existing code | Delete existing file, rebuild dari scratch dengan semantic tokens |
| 5 | Mock data imbalance | Minimum 6 reviews + 20 findings untuk demo convincing |
| 6 | Base UI (bukan Radix) — no `asChild` | Gunakan `className` + `buttonVariants()` langsung |

---

## 14. References

- Blueprint: `qwen-result.txt` (586 lines) — source of truth untuk UI layout
- NIST SSDF: https://csrc.nist.gov/projects/ssdf (SP 800-218 v1.1) — **fix mapping dulu**
- AGENTS.md: conventions, styling, RBAC, shadcn patterns
- DESIGN.md: color tokens, spacing, responsive breakpoints
- Pattern reference: `app/(dashboard)/projects/` (CRUD + table + badges)
- Pattern reference: `app/(dashboard)/admin/audit/audit-log.tsx` (audit trail)
- Existing sidebar: `components/app-sidebar.tsx:106` — ai-reviewer item
- Route guard: `components/route-guard.tsx` — `RouteGuard requiredRole`
