import { SEVERITY_TONE } from "@/lib/error-tracking-utils"
import type { ErrorSeverity } from "@/lib/mock-errors"
import { cn } from "@/lib/utils"

export function ErrorSeverityBadge({
  severity,
}: {
  severity: ErrorSeverity
}) {
  const tone = SEVERITY_TONE[severity]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px font-medium] uppercase tracking-wide ring-1",
        tone.bg,
        tone.text,
        tone.ring,
      )}
    >
      {severity}
    </span>
  )
}
