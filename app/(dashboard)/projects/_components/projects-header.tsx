import { FolderGit2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/mock-data"

const TITLE: Record<Role, string> = {
  ADMIN: "Semua Proyek",
  USER: "Proyek Saya",
  VIEWER: "Proyek yang Di-share",
}

const DESC: Record<Role, string> = {
  ADMIN: "Seluruh proyek dari semua user di sistem.",
  USER: "Proyek milik Anda. Proyek user lain tidak tampil di sini.",
  VIEWER: "Proyek yang di-share ke Anda untuk dipantau (read-only).",
}

interface ProjectsHeaderProps {
  role: Role
  canCreate: boolean
  onCreate: () => void
}

export function ProjectsHeader({
  role,
  canCreate,
  onCreate,
}: ProjectsHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <FolderGit2 className="size-6 text-primary" aria-hidden="true" />
          {TITLE[role]}
        </h1>
        <p className="text-sm text-muted-foreground">{DESC[role]}</p>
      </div>

      {canCreate && (
        <Button onClick={onCreate} className="gap-1.5">
          <Plus className="size-4" aria-hidden="true" />
          Buat Proyek
        </Button>
      )}
    </header>
  )
}
