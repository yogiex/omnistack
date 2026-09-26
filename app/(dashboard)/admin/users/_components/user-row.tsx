"use client"

import {
  MailCheck,
  MailX,
  MoreVertical,
  Pencil,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserStatus, type MockUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

import { InvitedBadge, RoleBadge } from "./role-badge"

export interface UserRowHandlers {
  onEdit: (user: MockUser) => void
  onResendInvite: (user: MockUser) => void
  onCancelInvite: (user: MockUser) => void
  onToggleSuspend: (user: MockUser) => void
  onResetPassword: (user: MockUser) => void
  onToggle2FA: (user: MockUser) => void
  onRequestDelete: (user: MockUser) => void
}

interface UserRowProps {
  user: MockUser
  isSelf: boolean
  has2FA: boolean
  canSuspend: boolean
  canDelete: boolean
  handlers: UserRowHandlers
}

export function UserRow({
  user,
  isSelf,
  has2FA,
  canSuspend,
  canDelete,
  handlers,
}: UserRowProps) {
  const status = getUserStatus(user)
  const isInvited = status === "invited"

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
        status !== "active" && "opacity-70",
      )}
    >
      {/* Identitas */}
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className={cn(isInvited && "opacity-60")}>
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt="" />
          ) : null}
          <AvatarFallback>{isInvited ? "?" : user.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-medium",
              isInvited && "italic text-muted-foreground",
            )}
          >
            {user.name}
            {isSelf && (
              <span className="ml-2 text-xs not-italic text-muted-foreground">
                (kamu)
              </span>
            )}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Badges + menu */}
      <div className="flex shrink-0 items-center gap-2">
        <RoleBadge role={user.role} />
        {isInvited && <InvitedBadge />}
        {has2FA && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500">
            2FA
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Aksi untuk ${user.name}`}
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {isInvited ? (
              <>
                <DropdownMenuItem onClick={() => handlers.onResendInvite(user)}>
                  <MailCheck />
                  Kirim Ulang Undangan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlers.onCancelInvite(user)}
                  variant="destructive"
                >
                  <MailX />
                  Batalkan Undangan
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => handlers.onEdit(user)}>
                  <Pencil />
                  Edit / Ubah Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlers.onResetPassword(user)}>
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlers.onToggleSuspend(user)}
                  disabled={!canSuspend}
                >
                  {user.isActive ? (
                    <>
                      <ShieldBan />
                      Suspend Akun
                    </>
                  ) : (
                    <>
                      <ShieldCheck />
                      Aktifkan Kembali
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlers.onToggle2FA(user)}
                  disabled={isSelf}
                >
                  {has2FA ? (
                    <>
                      <ShieldOff />
                      Disable 2FA
                    </>
                  ) : (
                    <>
                      <ShieldCheck />
                      Enable 2FA
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handlers.onRequestDelete(user)}
                  disabled={!canDelete}
                  variant="destructive"
                >
                  <Trash2 />
                  Hapus Permanen
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
