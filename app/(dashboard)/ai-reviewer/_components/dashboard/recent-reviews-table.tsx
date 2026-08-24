"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ScoreBadge } from "../shared/score-badge"
import { getStatusConfig } from "../mock-data-reviewer"
import type { Review } from "../types"

interface RecentReviewsTableProps {
  reviews: Review[]
  onSelectReview: (id: string) => void
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentReviewsTable({ reviews, onSelectReview }: RecentReviewsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Repo</TableHead>
            <TableHead>PR</TableHead>
            <TableHead className="hidden md:table-cell">Branch</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Files</TableHead>
            <TableHead className="hidden sm:table-cell">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => {
            const statusConfig = getStatusConfig(review.status)

            return (
              <TableRow
                key={review.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectReview(review.id)}
              >
                <TableCell>
                  <span className="font-medium">{review.repo}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">PR #{review.pr.number}</Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {review.pr.branch}
                </TableCell>
                <TableCell>
                  <ScoreBadge score={review.score} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                    {statusConfig.icon} {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {review.filesChanged}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {formatTimeAgo(review.scannedAt)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
