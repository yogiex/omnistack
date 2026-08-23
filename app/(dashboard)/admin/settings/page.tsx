import { RouteGuard } from "@/components/route-guard"
import { SystemSettingsForm } from "./system-settings"

export default function AdminSettingsPage() {
  return (
    <RouteGuard requiredRole="ADMIN">
      <SystemSettingsForm />
    </RouteGuard>
  )
}
