"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSeverityConfig } from "../mock-data-reviewer"
import { SeverityBadge } from "../shared/severity-badge"
import type { Finding, Severity } from "../types"

interface FindingsListProps {
  findings: Finding[]
  onSelectFinding: (id: string) => void
}

const SEVERITY_RANK: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Info: 4,
}

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const severityDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
    if (severityDiff !== 0) return severityDiff
    return b.cvss - a.cvss
  })
}

export function FindingsList({ findings, onSelectFinding }: FindingsListProps) {
  const sorted = sortFindings(findings)

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        No findings match the current filters.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((finding) => {
        const config = getSeverityConfig(finding.severity)
        return (
          <div
            key={finding.id}
            className={cn("rounded-lg border p-4", config.bg, config.border)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={finding.severity} />
                  <span className="text-sm font-mono text-muted-foreground">
                    {finding.cwe}
                  </span>
                </div>
                <p className="text-sm font-medium">{finding.message}</p>
                <p className="text-xs text-muted-foreground">
                  {finding.file}:{finding.line}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectFinding(finding.id)}
              >
                View Detail →
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>SSDF: {finding.ssdfPractice}</span>
              <span>OWASP: {finding.owasp}</span>
              <span>CVSS: {finding.cvss}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
