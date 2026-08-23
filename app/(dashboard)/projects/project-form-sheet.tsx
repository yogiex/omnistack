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

export interface ProjectForm {
  name: string
  description: string
}

export const EMPTY_PROJECT_FORM: ProjectForm = { name: "", description: "" }

interface ProjectFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  form: ProjectForm
  onFormChange: (form: ProjectForm) => void
  onSubmit: () => void
}

export function ProjectFormSheet({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  onSubmit,
}: ProjectFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Buat Proyek Baru" : "Edit Proyek"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Isi detail proyek baru. Status default adalah Active."
              : "Ubah nama atau deskripsi proyek."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="project-form-name">Nama Proyek</Label>
              <Input
                id="project-form-name"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                placeholder="my-awesome-app"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-form-description">Deskripsi</Label>
              <Input
                id="project-form-description"
                value={form.description}
                onChange={(e) =>
                  onFormChange({ ...form, description: e.target.value })
                }
                placeholder="Deskripsi singkat proyek"
              />
            </div>

            {mode === "create" && (
              <p className="text-xs text-muted-foreground">
                Proyek akan terdaftar dengan status{" "}
                <BadgeActive /> dan menjadi milik akun Anda.
              </p>
            )}
          </div>

          <SheetFooter>
            <Button type="submit">
              {mode === "create" ? "Buat Proyek" : "Simpan Perubahan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function BadgeActive() {
  return (
    <span className="rounded border px-1 py-0.5 font-medium text-green-500">
      Active
    </span>
  )
}
