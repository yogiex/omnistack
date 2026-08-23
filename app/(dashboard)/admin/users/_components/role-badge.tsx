import { Clock, Code2, Crown, Eye, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/mock-data"

const ROLE_META: Record<Role, { icon: LucideIcon; className: string }> = {
  ADMIN: {
    icon: Crown,
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  USER: {
    icon: Code2,
    className: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  VIEWER: {
    icon: Eye,
    className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
}

interface RoleBadgeProps {
  role: Role
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const { icon: Icon, className: roleClassName } = ROLE_META[role]

  return (
    <Badge variant="outline" className={`gap-1.5 ${roleClassName} ${className ?? ""}`}>
      <Icon className="h-3 w-3" />
      {role}
    </Badge>
  )
}

interface InvitedBadgeProps {
  className?: string
}

export function InvitedBadge({ className }: InvitedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 italic text-muted-foreground ${className ?? ""}`}
    >
      <Clock className="h-3 w-3" />
      Invited
    </Badge>
  )
}
