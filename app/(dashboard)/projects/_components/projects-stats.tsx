import {
  Boxes,
  CircleCheck,
  CircleX,
  LoaderCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  hint: string
  iconClassName?: string
}

function StatCard({ icon, label, value, hint, iconClassName }: StatCardProps) {
  return (
    <Card className="p-6">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10",
          iconClassName
        )}
      >
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

interface ProjectsStatsProps {
  total: number
  active: number
  building: number
  failed: number
}

export function ProjectsStats({
  total,
  active,
  building,
  failed,
}: ProjectsStatsProps) {
  const pct = (n: number) =>
    total > 0 ? `${Math.round((n / total) * 100)}% dari total` : "—"

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        icon={<Boxes className="h-5 w-5 text-primary" />}
        label="Total Proyek"
        value={total}
        hint="semua status"
      />
      <StatCard
        icon={<CircleCheck className="h-5 w-5 text-green-500" />}
        label="Live"
        value={active}
        hint={pct(active)}
      />
      <StatCard
        icon={
          <LoaderCircle className="h-5 w-5 animate-spin text-yellow-500" />
        }
        label="Building"
        value={building}
        hint="sedang dideploy"
      />
      <StatCard
        icon={<CircleX className="h-5 w-5 text-red-500" />}
        label="Failed"
        value={failed}
        hint={pct(failed)}
      />
    </div>
  )
}
