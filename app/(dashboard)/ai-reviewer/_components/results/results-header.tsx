import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ScoreBadge } from "../shared/score-badge"
import { getStatusConfig } from "../mock-data-reviewer"
import type { Review } from "../types"

interface ResultsHeaderProps {
  review: Review
}

export function ResultsHeader({ review }: ResultsHeaderProps) {
  const statusConfig = getStatusConfig(review.status)

  return (
    <div className="flex flex-wrap items-center gap-4">
      <h2 className="text-2xl font-bold">{review.repo}</h2>
      <Badge variant="outline">PR #{review.pr.number}</Badge>
      <Badge variant="outline">{review.pr.branch}</Badge>
      <ScoreBadge score={review.score} />
      <Badge variant="outline" className={cn(statusConfig.color)}>
        {statusConfig.icon} {statusConfig.label}
      </Badge>
      <span className="ml-auto text-sm text-muted-foreground">
        {review.filesChanged} files · +{review.linesAdded}/-{review.linesRemoved} ·{" "}
        {review.profile}
      </span>
    </div>
  )
}
