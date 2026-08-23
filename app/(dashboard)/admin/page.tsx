import { RouteGuard } from "@/components/route-guard"
import { AdminOverview } from "./admin-overview"

export default function AdminPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <AdminOverview />
    </RouteGuard>
  )
}
