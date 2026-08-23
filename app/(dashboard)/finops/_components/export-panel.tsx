"use client"

import { useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Share2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type ReportType = "monthly" | "detailed" | "invoice"
type Format = "pdf" | "csv" | "excel" | "json"

interface ExportEntry {
  id: string
  name: string
  timeLabel: string
  size: string
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "monthly", label: "Monthly Summary" },
  { value: "detailed", label: "Detailed Breakdown" },
  { value: "invoice", label: "Client Invoice" },
]

const FORMATS: { value: Format; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
  { value: "json", label: "JSON" },
]

const SIZES = ["2.4 MB", "1.8 MB", "456 KB"] as const

const INITIAL_EXPORTS: ExportEntry[] = [
  { id: "exp-3", name: "finops-report-august-2026.pdf", timeLabel: "2 jam lalu", size: "2.4 MB" },
  { id: "exp-2", name: "client-invoice-acme-corp-august-2026.pdf", timeLabel: "1 hari lalu", size: "1.8 MB" },
  { id: "exp-1", name: "cost-breakdown-all-projects-august-2026.csv", timeLabel: "3 hari lalu", size: "456 KB" },
]

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
]

function extensionFor(format: Format): string {
  switch (format) {
    case "pdf":
      return "pdf"
    case "csv":
      return "csv"
    case "excel":
      return "xlsx"
    case "json":
      return "json"
  }
}

function formatIcon(name: string) {
  if (name.endsWith(".csv") || name.endsWith(".xlsx")) {
    return <FileSpreadsheet className="size-4 text-emerald-500" />
  }
  if (name.endsWith(".json")) {
    return <FileJson className="size-4 text-amber-500" />
  }
  return <FileText className="size-4 text-muted-foreground" />
}

export function ExportPanel() {
  const [reportType, setReportType] = useState<ReportType>("monthly")
  const [format, setFormat] = useState<Format>("pdf")
  const [includeCostBreakdown, setIncludeCostBreakdown] = useState(true)
  const [includeTrends, setIncludeTrends] = useState(true)
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)

  const [isGenerating, setIsGenerating] = useState(false)
  const [recentExports, setRecentExports] = useState<ExportEntry[]>(INITIAL_EXPORTS)
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false)
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null)

  const totalExports = recentExports.length
  const visibleExports = recentExports.slice(0, 5)

  function handleGenerateReport() {
    if (isGenerating) return
    setIsGenerating(true)
    window.setTimeout(() => {
      const now = new Date()
      const monthName = MONTHS[now.getMonth()]
      const size = SIZES[totalExports % SIZES.length]
      const entry: ExportEntry = {
        id: `exp-${now.getTime()}`,
        name: `finops-report-${monthName}-${now.getFullYear()}.${extensionFor(format)}`,
        timeLabel: "Baru saja",
        size,
      }
      setRecentExports((prev) => [entry, ...prev])
      setIsGenerating(false)
    }, 900)
  }

  function handleScheduleRecurring() {
    setScheduleConfirmed(true)
    window.setTimeout(() => setScheduleConfirmed(false), 3000)
  }

  function handleAction(entryId: string, action: "Download" | "Share") {
    setInlineFeedback(`${action}: ${recentExports.find((e) => e.id === entryId)?.name ?? ""} — Mock: ${action}`)
  }

  function handleDelete(entryId: string) {
    setRecentExports((prev) => prev.filter((e) => e.id !== entryId))
    setInlineFeedback(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export &amp; Reports</CardTitle>
        <CardDescription>Generate and manage cost reports for your projects.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        {/* A) Generate Report */}
        <section className="grid gap-5">
          <h3 className="text-sm font-semibold">Generate Report</h3>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs">Report Type</Label>
            <div role="radiogroup" aria-label="Report Type" className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  role="radio"
                  aria-checked={reportType === rt.value}
                  onClick={() => setReportType(rt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    reportType === rt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs">Format</Label>
            <div role="radiogroup" aria-label="Format" className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  role="radio"
                  aria-checked={format === f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "min-w-16 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    format === f.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs">Include</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={includeCostBreakdown}
                  onCheckedChange={(checked) => setIncludeCostBreakdown(checked === true)}
                />
                Cost breakdown
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={includeTrends} onCheckedChange={(checked) => setIncludeTrends(checked === true)} />
                Trends
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={includeRecommendations}
                  onCheckedChange={(checked) => setIncludeRecommendations(checked === true)}
                />
                Recommendations
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(checked === true)}
                />
                Raw data
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating && <Loader2 className="animate-spin" />}
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
            <Button variant="outline" onClick={handleScheduleRecurring}>
              <CalendarClock />
              Schedule Recurring Report
            </Button>
            {scheduleConfirmed && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Recurring report scheduled (mock)
              </span>
            )}
          </div>
        </section>

        {/* B) Recent Exports */}
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">Recent Exports</h3>

          {inlineFeedback && (
            <p className="text-muted-foreground text-xs" aria-live="polite">
              {inlineFeedback}
            </p>
          )}

          <ul className="divide-border grid divide-y rounded-lg border">
            {visibleExports.map((entry) => (
              <li key={entry.id} className="hover:bg-muted/50 flex items-center gap-3 px-3 py-2.5 transition-colors">
                {formatIcon(entry.name)}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs">{entry.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {entry.timeLabel} · {entry.size}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleAction(entry.id, "Download")}>
                    <Download />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleAction(entry.id, "Share")}>
                    <Share2 />
                    <span className="sr-only">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
            {visibleExports.length === 0 && (
              <li className="text-muted-foreground px-3 py-6 text-center text-xs">No exports yet.</li>
            )}
          </ul>

          <p className="text-muted-foreground text-xs">
            Showing {visibleExports.length} of {totalExports}
          </p>
        </section>
      </CardContent>
    </Card>
  )
}
