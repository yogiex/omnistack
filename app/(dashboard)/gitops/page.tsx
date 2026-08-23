import { RouteGuard } from "@/components/route-guard"
import { GitOpsClient } from "./gitops-client"

export default function GitOpsPage() {
  return (
    <RouteGuard requiredRole="USER">
      <GitOpsClient />
    </RouteGuard>
  )
}
