import { STATUS_TONE } from "@/lib/error-tracking-utils"
import type { ErrorStatus } from "@/lib/mock-errors"
import { cn } from "@/lib/utils"

export function ErrorStatusBadge({ status }: { status: ErrorStatus }) {
  const tone = STATUS_TONE[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        tone.bg,
        tone.text,
        tone.ring,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", tone.dot)}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}
