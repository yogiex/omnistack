import { RouteGuard } from "@/components/route-guard"
import { AiReviewerClient } from "./ai-reviewer-client"

export default function AiReviewerPage() {
  return (
    <RouteGuard requiredRole="USER">
      <AiReviewerClient />
    </RouteGuard>
  )
}
