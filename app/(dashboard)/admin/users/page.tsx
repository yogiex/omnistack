import { RouteGuard } from "@/components/route-guard"
import { UsersPageClient } from "./users-page-client"

export default function AdminUsersPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <UsersPageClient />
    </RouteGuard>
  )
}
