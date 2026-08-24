import type { Review, Finding, SecurityPosture, ReviewStats, Severity, ReviewStatus } from "./types"

export const MOCK_POSTURE: SecurityPosture = {
  score: 82,
  openCriticals: 3,
  lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
]

export const MOCK_FINDINGS: Finding[] = [
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
]

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
