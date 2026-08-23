import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DeploymentStatus } from "@/lib/mock-data"

const STATUS_MAP: Record<
  DeploymentStatus,
  { label: string; className: string; dot: string }
> = {
  success: {
    label: "Success",
    className: "text-green-500 border-green-500/40 bg-green-500/10",
    dot: "bg-green-500",
  },
  building: {
    label: "Building",
    className: "text-yellow-500 border-yellow-500/40 bg-yellow-500/10",
    dot: "bg-yellow-500 animate-pulse",
  },
  failed: {
    label: "Failed",
    className: "text-destructive border-destructive/40 bg-destructive/10",
    dot: "bg-destructive",
  },
  queued: {
    label: "Queued",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
}

export function DeploymentStatusBadge({
  status,
}: {
  status: DeploymentStatus
}) {
  const config = STATUS_MAP[status]

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  )
}
