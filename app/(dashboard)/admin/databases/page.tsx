import { RouteGuard } from "@/components/route-guard"
import { AdminDatabasesClient } from "./admin-databases-client"

export default function AdminDatabasesPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <AdminDatabasesClient />
    </RouteGuard>
  )
}
