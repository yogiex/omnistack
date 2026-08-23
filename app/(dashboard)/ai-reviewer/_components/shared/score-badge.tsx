import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
