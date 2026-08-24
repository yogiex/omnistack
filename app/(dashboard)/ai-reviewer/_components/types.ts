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
  score: number
  status: ReviewStatus
  severity: Record<Severity, number>
  profile: ReviewProfile
  filesChanged: number
  linesAdded: number
  linesRemoved: number
  scannedAt: string
}

export interface Finding {
  id: string
  reviewId: string
  severity: Severity
  cwe: string
  owasp: string
  ssdfPractice: string
  file: string
  line: number
  column?: number
  message: string
  explanation: string
  fixSuggestion: string
  cvss: number
  status: FindingStatus
}

export interface SecurityPosture {
  score: number
  openCriticals: number
  lastScan: string
  nextScheduled: string
}

export interface ReviewStats {
  totalReviews: number
  openFindings: number
  criticalAndHigh: number
  fixedThisWeek: number
  trends: {
    totalReviews: number
    openFindings: number
    criticalAndHigh: number
    fixedThisWeek: number
  }
}
