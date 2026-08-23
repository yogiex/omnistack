import type { Metadata } from "next"
import { RouteGuard } from "@/components/route-guard"
import { ReviewShell } from "./_components/review-shell"

export const metadata: Metadata = {
  title: "AI Code Reviewer - OmniStack",
}

export default function AiReviewerPage() {
  return (
    <RouteGuard requiredRole="USER">
      <ReviewShell />
    </RouteGuard>
  )
}
