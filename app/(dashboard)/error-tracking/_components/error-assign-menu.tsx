"use client"

import { UserCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MOCK_USERS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ErrorAssignMenuProps {
  errorId: string
  currentAssigneeId?: string
  onAssign: (errorId: string, userId: string) => void
  onUnassign?: (errorId: string) => void
}

const ASSIGNEES = MOCK_USERS.filter((u) => u.isActive)

/**
 * shadcn `DropdownMenu` (Base UI), bukan `<div>` + `<button>` manual.
 * Versi sebelumnya tidak punya: focus management, `Escape` untuk menutup,
 * navigasi panah, dan role `menu`. Screen reader membacanya sebagai sekumpulan
 * tombol lepas, bukan sebagai satu menu.
 */
export function ErrorAssignMenu({
  errorId,
  currentAssigneeId,
  onAssign,
  onUnassign,
}: ErrorAssignMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        <UserCheck />
        {currentAssigneeId ? "Ubah assignee" : "Assign ke..."}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Assignee</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currentAssigneeId && onUnassign && (
          <DropdownMenuItem onClick={() => onUnassign(errorId)}>
            <span className="text-xs text-muted-foreground">
              Hapus assignee
            </span>
          </DropdownMenuItem>
        )}
        {ASSIGNEES.map((u) => (
          <DropdownMenuItem key={u.id} onClick={() => onAssign(errorId, u.id)}>
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                u.id === currentAssigneeId
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/40",
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{u.name}</span>
            <span className="text-xs text-muted-foreground">{u.role}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
