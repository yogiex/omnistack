import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getSeverityConfig } from "../mock-data-reviewer"
import type { Severity } from "../types"

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = getSeverityConfig(severity)
  return (
    <Badge variant="outline" className={cn("text-xs font-mono", config.color, config.bg, className)}>
      {severity}
    </Badge>
  )
}
