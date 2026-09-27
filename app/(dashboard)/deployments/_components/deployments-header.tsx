import { Rocket } from "lucide-react"

import type { Role } from "@/lib/mock-data"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "Semua Deployment",
  USER: "Deployment Saya",
  VIEWER: "Deployment yang Di-share",
}

interface DeploymentsHeaderProps {
  role: Role
  totalCount: number
  projectCount: number
}

export function DeploymentsHeader({
  role,
  totalCount,
  projectCount,
}: DeploymentsHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Rocket className="size-7 text-primary" aria-hidden="true" />
        {TITLE_BY_ROLE[role]}
      </h1>
      <p className="text-sm text-muted-foreground">
        {role === "VIEWER"
          ? "Deployment proyek yang di-share (read-only)."
          : `${totalCount} deployment dari ${projectCount} proyek.`}
      </p>
    </header>
  )
}
