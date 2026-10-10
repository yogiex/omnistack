import { Code2, Crown, Eye, Users, type LucideIcon } from "lucide-react"

import { StatCard, StatGrid } from "@/components/stat-card"
import { getUserStatus, type MockUser } from "@/lib/mock-data"

interface StatsGridProps {
  users: MockUser[]
}

export function StatsGrid({ users }: StatsGridProps) {
  const invitedCount = users.filter(
    (u) => getUserStatus(u) === "invited"
  ).length

  const nonInvited = users.filter((u) => getUserStatus(u) !== "invited")
  const admins = nonInvited.filter((u) => u.role === "ADMIN")
  const activeAdmins = admins.filter(
    (u) => getUserStatus(u) === "active"
  ).length
  const developers = nonInvited.filter((u) => u.role === "USER")
  const activeDevs = developers.filter(
    (u) => getUserStatus(u) === "active"
  ).length
  const viewers = nonInvited.filter((u) => u.role === "VIEWER")
  const activeViewers = viewers.filter(
    (u) => getUserStatus(u) === "active"
  ).length

  const stats: {
    icon: LucideIcon
    value: number
    label: string
    hint: string
    valueClassName?: string
  }[] = [
    {
      icon: Users,
      value: users.length,
      label: "Total Pengguna",
      hint: `${invitedCount} undangan menunggu`,
    },
    {
      icon: Crown,
      value: admins.length,
      label: "Administrator",
      hint: `${activeAdmins} aktif · min. 1 wajib`,
      valueClassName: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: Code2,
      value: developers.length,
      label: "Developer",
      hint: `${activeDevs} aktif`,
      valueClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Eye,
      value: viewers.length,
      label: "Viewer",
      hint: `${activeViewers} aktif`,
      valueClassName: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <StatGrid cols={4}>
      {stats.map(({ icon: Icon, value, label, hint, valueClassName }) => (
        <StatCard
          key={label}
          title={label}
          value={value}
          hint={hint}
          icon={<Icon />}
          valueClassName={valueClassName}
        />
      ))}
    </StatGrid>
  )
}
