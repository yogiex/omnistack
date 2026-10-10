"use client"

import {
  Clock,
  Lock,
  MailCheck,
  MailX,
  MoreVertical,
  Pencil,
  ShieldBan,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRelativeTime, getUserStatus, type MockUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

import { RoleBadge } from "./role-badge"

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
  selected: boolean
  onSelectedChange: (checked: boolean) => void
  handlers: UserRowHandlers
}

function UserRowMeta({ user }: { user: MockUser }) {
  const status = getUserStatus(user)

  if (status === "invited") {
    return (
      <span className="text-xs text-muted-foreground">
        <Clock className="mr-1 inline size-3" aria-hidden="true" />
        Dikirim {formatRelativeTime(user.invitedAt)}
        {user.inviteExpiresAt &&
          ` · kedaluwarsa ${formatRelativeTime(user.inviteExpiresAt)}`}
      </span>
    )
  }

  if (status === "suspended") {
    return (
      <span className="text-xs text-destructive">
        Ditangguhkan sejak {formatRelativeTime(user.lastActiveAt)}
      </span>
    )
  }

  return (
    <span className="text-xs text-muted-foreground">
      Terakhir aktif: {formatRelativeTime(user.lastActiveAt)}
    </span>
  )
}

export function UserRow({
  user,
  isSelf,
  has2FA,
  canSuspend,
  canDelete,
  selected,
  onSelectedChange,
  handlers,
}: UserRowProps) {
  const status = getUserStatus(user)
  const isInvited = status === "invited"

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4",
        selected && "ring-2 ring-ring bg-muted/30",
      )}
    >
      {/* Identitas */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelectedChange}
          disabled={isSelf}
          aria-label={`Pilih ${user.name}`}
        />

        <Avatar className="size-10 shrink-0">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt="" />
          ) : null}
          <AvatarFallback>
            {isInvited
              ? "?"
              : user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p
            className={cn(
              "truncate text-sm font-medium",
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
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <UserRowMeta user={user} />
        </div>
      </div>

      {/* Badges + menu */}
      <div className="flex shrink-0 items-center gap-2">
        <RoleBadge role={user.role} />
        {isInvited && (
          <span className="text-xs italic text-muted-foreground">Invited</span>
        )}
        {has2FA && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500">
            2FA
          </span>
        )}
        {!canDelete && (
          <Lock
            className="size-3.5 text-muted-foreground"
            aria-label="Administrator terakhir"
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Aksi untuk ${user.name}`}
            aria-haspopup="menu"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-8",
            )}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlers.onEdit(user)}>
                  <Pencil />
                  Edit / Ubah Role
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
                      <ShieldCheck />
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
              </>
            )}
            <DropdownMenuItem
              onClick={() => handlers.onRequestDelete(user)}
              disabled={!canDelete}
              variant="destructive"
            >
              <Trash2 />
              Hapus Permanen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
