"use client"

import { getReviewById, getFindingsByReview } from "../mock-data-reviewer"
import { ResultsHeader } from "./results-header"
import { ResultsTabs } from "./results-tabs"

interface ResultsViewProps {
  reviewId: string
  onSelectFinding: (id: string) => void
}

export function ResultsView({ reviewId, onSelectFinding }: ResultsViewProps) {
  const review = getReviewById(reviewId)
  const findings = getFindingsByReview(reviewId)

  if (!review) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        Review not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ResultsHeader review={review} />
      <ResultsTabs
        review={review}
        findings={findings}
        onSelectFinding={onSelectFinding}
      />
    </div>
  )
}
