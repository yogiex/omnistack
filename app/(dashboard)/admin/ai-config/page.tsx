import { RouteGuard } from "@/components/route-guard"
import { AiConfigClient } from "./ai-config-client"

export default function AiConfigPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <AiConfigClient />
    </RouteGuard>
  )
}
