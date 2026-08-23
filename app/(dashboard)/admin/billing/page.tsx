import { RouteGuard } from "@/components/route-guard"
import { BillingClient } from "./billing-client"

export default function BillingPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <BillingClient />
    </RouteGuard>
  )
}
