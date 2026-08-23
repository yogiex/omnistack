"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { MOCK_FINDINGS } from "./mock-data-reviewer"
import { SeverityBadge } from "./shared/severity-badge"

interface FindingDetailSheetProps {
  reviewId: string
  findingId: string
  onClose: () => void
}

export function FindingDetailSheet({ reviewId, findingId, onClose }: FindingDetailSheetProps) {
  const finding = MOCK_FINDINGS.find(
    (f) => f.id === findingId && f.reviewId === reviewId
  )

  if (!finding) {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Finding not found</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            {finding.cwe} · {finding.message}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 text-sm text-muted-foreground">
          {finding.file}:{finding.line}
        </div>

        <Card className="mt-4">
          <CardContent className="grid grid-cols-2 gap-2 p-4 text-sm">
            <div>
              <span className="text-muted-foreground">NIST SSDF:</span>{" "}
              {finding.ssdfPractice}
            </div>
            <div>
              <span className="text-muted-foreground">OWASP:</span>{" "}
              {finding.owasp}
            </div>
            <div>
              <span className="text-muted-foreground">CWE:</span>{" "}
              {finding.cwe}
            </div>
            <div>
              <span className="text-muted-foreground">CVSS:</span>{" "}
              <span
                className={cn(
                  "font-bold",
                  finding.cvss >= 9 && "text-destructive",
                  finding.cvss >= 7 && finding.cvss < 9 && "text-orange-500"
                )}
              >
                {finding.cvss}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <h4 className="text-sm font-semibold">Why this is dangerous</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {finding.explanation}
          </p>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold">Recommended Fix</h4>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted p-3 font-mono text-xs">
            {finding.fixSuggestion}
          </pre>
        </div>

        <div className="mt-6 flex gap-2">
          <Button size="sm">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Apply AI Fix
          </Button>
          <Button size="sm" variant="outline">
            Mark False Positive
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
