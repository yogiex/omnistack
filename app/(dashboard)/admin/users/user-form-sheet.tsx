"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Role } from "@/lib/mock-data"

export interface UserForm {
  name: string
  email: string
  role: Role
}

export const EMPTY_USER_FORM: UserForm = { name: "", email: "", role: "USER" }

const ROLES: Role[] = ["ADMIN", "USER", "VIEWER"]

const ROLE_HINTS: Record<Role, string> = {
  ADMIN: "Akses penuh seluruh sistem",
  USER: "Kelola proyek & deployment miliknya",
  VIEWER: "Hanya bisa melihat data",
}

interface UserFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UserForm
  onFormChange: (form: UserForm) => void
  onSubmit: () => void
}

/**
 * Edit-only. Pembuatan user baru lewat `<InviteUserDialog />` — mode
 * "create" sebelumnya ada di sini tapi tidak pernah di-set, jadi sheet
 * ini tidak pernah menampilkan form kosong.
 */
export function UserFormSheet({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
}: UserFormSheetProps) {
  const canSubmit =
    form.name.trim().length > 0 && form.email.trim().includes("@")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Ubah data user atau promote/demote role-nya.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="form-name">Nama Lengkap</Label>
            <Input
              id="form-name"
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
              placeholder="Nama Pengguna"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-email">Email</Label>
            <Input
              id="form-email"
              type="email"
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
              placeholder="nama@perusahaan.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                onFormChange({ ...form, role: value as Role })
              }
            >
              <SelectTrigger id="form-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role} — {ROLE_HINTS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ROLE_HINTS[form.role]}
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button disabled={!canSubmit} onClick={onSubmit}>
            Simpan Perubahan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
