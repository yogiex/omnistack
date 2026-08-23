import { RouteGuard } from "@/components/route-guard"
import { InfrastructureClient } from "./infrastructure-client"

export default function InfrastructurePage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <InfrastructureClient />
    </RouteGuard>
  )
}
