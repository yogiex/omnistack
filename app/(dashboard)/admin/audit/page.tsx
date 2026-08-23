import { RouteGuard } from "@/components/route-guard"
import { AuditLogList } from "./audit-log"

export default function AdminAuditPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <AuditLogList />
    </RouteGuard>
  )
}
