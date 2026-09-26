import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Role } from "@/lib/mock-data"

interface RoleDistributionProps {
  counts: Record<Role, number>
  total: number
  className?: string
}

const ROLE_META: { role: Role; bar: string; dot: string }[] = [
  { role: "USER", bar: "bg-blue-500", dot: "bg-blue-500" },
  { role: "VIEWER", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { role: "ADMIN", bar: "bg-amber-500", dot: "bg-amber-500" },
]

export function RoleDistribution({
  counts,
  total,
  className,
}: RoleDistributionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Distribusi Role</CardTitle>
        <CardDescription>Persentase role seluruh user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ROLE_META.map(({ role, bar, dot }) => {
          const count = counts[role]
          const percent = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <div key={role} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
                  <span className="font-medium">{role}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">
                  {count} <span className="text-xs">({percent}%)</span>
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Persentase ${role}`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn("h-full rounded-full transition-all", bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
