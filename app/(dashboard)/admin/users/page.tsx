import { RouteGuard } from "@/components/route-guard"
import { UsersList } from "./users-list"

export default function AdminUsersPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <UsersList />
    </RouteGuard>
  )
}
