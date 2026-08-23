import { Brain } from "lucide-react"
import { getReviews, getStats, getPosture } from "../mock-data-reviewer"
import { SecurityPostureBanner } from "./security-posture-banner"
import { StatsGrid } from "./stats-grid"
import { RecentReviewsTable } from "./recent-reviews-table"

interface DashboardViewProps {
  onSelectReview: (id: string) => void
}

export function DashboardView({ onSelectReview }: DashboardViewProps) {
  const reviews = getReviews()
  const stats = getStats()
  const posture = getPosture()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Code Reviewer</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered security and code quality analysis
            </p>
          </div>
        </div>
      </div>

      <SecurityPostureBanner posture={posture} />

      <StatsGrid stats={stats} />

      <RecentReviewsTable reviews={reviews} onSelectReview={onSelectReview} />
    </div>
  )
}
