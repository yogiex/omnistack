"use client"

import {
  Archive,
  ArchiveRestore,
  Copy,
  MoreVertical,
  Pencil,
  Rocket,
  Trash2,
  UserRoundPlus,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ManagedProject, ProjectCardHandlers } from "./project-card"

interface ProjectActionsMenuProps {
  project: ManagedProject
  manageable: boolean
  isAdmin: boolean
  confirmDeleteId: string | null
  handlers: ProjectCardHandlers
  /** Optional: show deploy action (for table view) */
  showDeploy?: boolean
}

export function ProjectActionsMenu({
  project,
  manageable,
  isAdmin,
  confirmDeleteId,
  handlers,
  showDeploy = false,
}: ProjectActionsMenuProps) {
  if (!manageable) {
    return (
      <span className="text-xs text-muted-foreground">
        View only
      </span>
    )
  }

  if (confirmDeleteId === project.id) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-8 w-8 p-0"
          )}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Aksi untuk {project.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => handlers.onDelete(project)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Konfirmasi Hapus
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlers.onCancelDelete}>
            Batal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 w-8 p-0"
        )}
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Aksi untuk {project.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {showDeploy && (
          <DropdownMenuItem onClick={() => handlers.onDeploy(project)}>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handlers.onEdit(project)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlers.onToggleArchive(project)}
        >
          {project.archived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onClone(project)}>
          <Copy className="mr-2 h-4 w-4" />
          Clone
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => handlers.onTransfer(project)}>
            <UserRoundPlus className="mr-2 h-4 w-4" />
            Transfer Ownership
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handlers.onRequestDelete(project.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Permanen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
