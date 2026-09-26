"use client"

import { BadgeCheck, ShieldCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { SessionUser } from "@/lib/mock-data"
import { ROLE_META } from "@/lib/settings/constants"
import { cn } from "@/lib/utils"

import { ActiveSessionsCard } from "./shared/active-sessions-card"
import { DangerZoneCard } from "./shared/danger-zone-card"
import { RolePermissionsCard } from "./shared/role-permissions-card"

interface ProfileTabProps {
  /** `SessionUser`, bukan `MockUser` — yang pertama tidak membawa `password`. */
  user: SessionUser
  isViewer: boolean
  name: string
  onNameChange: (value: string) => void
  twoFAEnabled: boolean
  onToggle2FA: (value: boolean) => void
  isDirty: boolean
  isSaved: boolean
  onReset: () => void
  onSave: () => void
  onChangePassword: () => void
  onRevokeOtherSessions: () => void
  sessionsNotice: boolean
}

export function ProfileTab({
  user,
  isViewer,
  name,
  onNameChange,
  twoFAEnabled,
  onToggle2FA,
  isDirty,
  isSaved,
  onReset,
  onSave,
  onChangePassword,
  onRevokeOtherSessions,
  sessionsNotice,
}: ProfileTabProps) {
  const roleMeta = ROLE_META[user.role]

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Profil</CardTitle>
          <CardDescription>Informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt="" />
              ) : null}
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <Badge variant="outline" className="mt-1 gap-1.5 text-xs">
                <ShieldCheck aria-hidden="true" />
                {user.role} · {roleMeta.label}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="settings-name">Nama Lengkap</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={user.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah pada mode demo.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Role</span>
            <div
              className={cn(
                "flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
                roleMeta.tone,
              )}
            >
              <ShieldCheck aria-hidden="true" />
              {user.role} ({roleMeta.label})
            </div>
            <p className="text-xs text-muted-foreground">
              Role hanya dapat diubah oleh Administrator.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="settings-password-current">Ganti Password</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="settings-password-current"
                type="password"
                placeholder="Password saat ini"
                className="max-w-48"
              />
              <Input
                id="settings-password-new"
                type="password"
                placeholder="Password baru"
                className="max-w-48"
              />
              <Button variant="outline" onClick={onChangePassword}>
                Ganti Password
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="settings-2fa"
              checked={twoFAEnabled}
              disabled={isViewer}
              onCheckedChange={(checked) => onToggle2FA(Boolean(checked))}
            />
            <Label htmlFor="settings-2fa" className="font-normal">
              Two-Factor Authentication (2FA)
              <span
                className={cn(
                  "ml-1.5 text-xs font-medium",
                  twoFAEnabled
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                · {twoFAEnabled ? "Aktif" : "Nonaktif"}
              </span>
            </Label>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button onClick={onSave} disabled={!isDirty}>
              Simpan Perubahan
            </Button>
            {isSaved && (
              <span
                role="status"
                className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
              >
                <BadgeCheck aria-hidden="true" />
                Tersimpan
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <RolePermissionsCard role={user.role} />
        <ActiveSessionsCard
          isViewer={isViewer}
          onRevokeOthers={onRevokeOtherSessions}
          showNotice={sessionsNotice}
        />
        <DangerZoneCard />
      </div>
    </div>
  )
}
