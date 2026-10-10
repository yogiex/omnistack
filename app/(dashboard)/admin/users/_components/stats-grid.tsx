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
    hint: string
  }[] = [
    {
      icon: Users,
      value: users.length,
      label: "Total Pengguna",
      hint: `${invitedCount} undangan menunggu`,
    },
    {
      icon: Crown,
      value: admins,
      label: "Administrator",
      hint: "Min. 1 wajib aktif",
    },
    {
      icon: Code2,
      value: developers,
      label: "Developer",
      hint: `${activeDevs} aktif`,
    },
    {
      icon: Eye,
      value: viewers,
      label: "Viewer",
      hint: `${activeViewers} aktif`,
    },
  ]

  return (
    <StatGrid cols={4}>
      {stats.map(({ icon: Icon, value, label, hint }) => (
        <StatCard
          key={label}
          title={label}
          value={value}
          hint={hint}
          icon={<Icon />}
        />
      ))}
    </StatGrid>
  )
}