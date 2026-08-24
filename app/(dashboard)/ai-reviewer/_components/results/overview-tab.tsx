import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSeverityConfig } from "../mock-data-reviewer"
import type { Review, Severity } from "../types"

interface OverviewTabProps {
  review: Review
}

const SEVERITY_ORDER: Severity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
  "Info",
]

export function OverviewTab({ review }: OverviewTabProps) {
  const totalFindings = Object.values(review.severity).reduce(
    (sum, count) => sum + count,
    0
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-5 gap-3">
        {SEVERITY_ORDER.map((severity) => {
          const config = getSeverityConfig(severity)
          return (
            <div
              key={severity}
              className={cn(
                "rounded-lg border p-4 text-center",
                config.bg,
                config.border
              )}
            >
              <div className={cn("text-2xl font-bold", config.color)}>
                {review.severity[severity]}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {severity}
              </div>
            </div>
          )
        })}
      </div>
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4 text-sm md:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Total Findings</span>
            <div className="mt-1 font-semibold">{totalFindings}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Files Changed</span>
            <div className="mt-1 font-semibold">{review.filesChanged}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Lines Added / Removed</span>
            <div className="mt-1 font-semibold">
              +{review.linesAdded} / -{review.linesRemoved}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Profile</span>
            <div className="mt-1 font-semibold capitalize">
              {review.profile}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Scan Time</span>
            <div className="mt-1 font-semibold">
              {new Date(review.scannedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
