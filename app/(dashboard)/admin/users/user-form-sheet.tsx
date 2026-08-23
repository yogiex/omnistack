"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  mode: "create" | "edit"
  form: UserForm
  onFormChange: (form: UserForm) => void
  onSubmit: () => void
}

export function UserFormSheet({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  onSubmit,
}: UserFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Tambah User Baru" : "Edit User"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Buat akun baru dan tentukan role-nya."
              : "Ubah data user atau promote/demote role."}
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
            <select
              id="form-role"
              value={form.role}
              onChange={(e) =>
                onFormChange({ ...form, role: e.target.value as Role })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role} — {ROLE_HINTS[role]}
                </option>
              ))}
            </select>
          </div>

          {mode === "create" && (
            <p className="text-xs text-muted-foreground">
              Password awal akan diset ke{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                demo1234
              </code>{" "}
              (mock).
            </p>
          )}
        </div>

        <SheetFooter>
          <Button onClick={onSubmit}>
            {mode === "create" ? "Buat User" : "Simpan Perubahan"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
