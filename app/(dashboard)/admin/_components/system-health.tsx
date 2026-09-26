import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ServiceHealth {
  name: string
  uptime: number
}

const SERVICES: ServiceHealth[] = [
  { name: "API Server", uptime: 99.99 },
  { name: "Database", uptime: 99.95 },
  { name: "Storage", uptime: 97.2 },
  { name: "Worker Queue", uptime: 99.8 },
]

/**
 * Threshold tone:
 *  ≥ 99.5  → emerald (sehat)
 *  ≥ 98.0  → amber   (perhatian)
 *  < 98.0  → rose    (kritis)
 *
 * Angka uptime di atas masih hardcoded di mock layer — belum ada agent
 * yang mengirim heartbeat. Lihat `docs/audits/PROJECT-AUDIT.md`.
 */
function healthTone(uptime: number) {
  if (uptime >= 99.5) {
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    }
  }
  if (uptime >= 98) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    }
  }
  return {
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    label: "di bawah threshold",
  }
}

export function SystemHealth({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">System Health</CardTitle>
        <CardDescription>
          Status layanan aktif. Angka masih simulasi — belum ada heartbeat dari
          VPS node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {SERVICES.map((s) => {
          const tone = healthTone(s.uptime)
          return (
            <div key={s.name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", tone.dot)} />
                  <span className="truncate font-medium">{s.name}</span>
                </div>
                <span
                  className={cn(
                    "shrink-0 tabular-nums font-medium",
                    tone.text
                  )}
                >
                  {s.uptime.toFixed(2)}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={s.uptime}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Uptime ${s.name}`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn("h-full rounded-full transition-all", tone.bar)}
                  style={{ width: `${s.uptime}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
