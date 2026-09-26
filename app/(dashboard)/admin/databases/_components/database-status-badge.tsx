import { cn } from "@/lib/utils"
import type { DatabaseStatus } from "@/lib/mock-data"

/**
 * Status → warna semantik. Yang berdenyut pakai `animate-ping`, bukan
 * `animate-pulse`: ping punya cincin yang melebar, pulse hanya berkedip
 * di tempat — jadi "Mem-backup" tidak terlihat sama dengan "Sehat".
 */
const STATUS_META: Record<
  DatabaseStatus,
  { label: string; dot: string; text: string; pulse: boolean }
> = {
  HEALTHY: {
    label: "Sehat",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    pulse: false,
  },
  BACKUPING: {
    label: "Mem-backup",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    pulse: true,
  },
  ERROR: {
    label: "Error",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    pulse: false,
  },
  MAINTENANCE: {
    label: "Pemeliharaan",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    pulse: false,
  },
}

interface DatabaseStatusBadgeProps {
  status: DatabaseStatus
}

export function DatabaseStatusBadge({ status }: DatabaseStatusBadgeProps) {
  const meta = STATUS_META[status]

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", meta.text)}>
      <span className="relative flex size-2">
        {meta.pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              meta.dot,
            )}
            aria-hidden="true"
          />
        )}
        <span
          className={cn("relative inline-flex size-2 rounded-full", meta.dot)}
        />
      </span>
      {meta.label}
    </span>
  )
}
