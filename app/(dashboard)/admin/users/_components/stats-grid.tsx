import { Code2, Crown, Eye, Users, type LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { getUserStatus, type MockUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StatsGridProps {
  users: MockUser[]
}

export function StatsGrid({ users }: StatsGridProps) {
  const invitedCount = users.filter(
    (u) => getUserStatus(u) === "invited"
  ).length

  const nonInvited = users.filter((u) => getUserStatus(u) !== "invited")
  const admins = nonInvited.filter((u) => u.role === "ADMIN").length
  const developers = nonInvited.filter((u) => u.role === "USER").length
  const viewers = nonInvited.filter((u) => u.role === "VIEWER").length

  const activeDevs = nonInvited.filter(
    (u) => u.role === "USER" && getUserStatus(u) === "active"
  ).length
  const activeViewers = nonInvited.filter(
    (u) => u.role === "VIEWER" && getUserStatus(u) === "active"
  ).length

  const stats: {
    icon: LucideIcon
    value: number
    label: string
    trend: string
  }[] = [
    {
      icon: Users,
      value: users.length,
      label: "Total Pengguna",
      trend: `${invitedCount} undangan menunggu`,
    },
    {
      icon: Crown,
      value: admins,
      label: "Administrator",
      trend: "Min. 1 wajib aktif",
    },
    {
      icon: Code2,
      value: developers,
      label: "Developer",
      trend: `${activeDevs} aktif`,
    },
    {
      icon: Eye,
      value: viewers,
      label: "Viewer",
      trend: `${activeViewers} aktif`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map(({ icon: Icon, value, label, trend }) => (
        <Card key={label} className="rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className={cn("h-5 w-5 text-muted-foreground")} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="text-xs text-muted-foreground">{trend}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
