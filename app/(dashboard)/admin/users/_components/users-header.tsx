import { UserRoundPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UsersHeaderProps {
  onInvite: () => void
}

export function UsersHeader({ onInvite }: UsersHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="size-7 text-primary" aria-hidden="true" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola user, role, dan undangan tim. Hanya ADMIN yang dapat
          mengakses.
        </p>
      </div>
      <Button onClick={onInvite} className="gap-1.5">
        <UserRoundPlus className="size-4" aria-hidden="true" />
        Invite User
      </Button>
    </header>
  )
}
