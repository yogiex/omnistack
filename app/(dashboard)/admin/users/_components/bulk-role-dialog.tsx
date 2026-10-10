"use client"

import { UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Role } from "@/lib/mock-data"

interface BulkRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  currentRole: Role
  onRoleChange: (role: Role) => void
  onConfirm: () => void
  isLastActiveAdmin: boolean
}

export function BulkRoleDialog({
  open,
  onOpenChange,
  selectedCount,
  currentRole,
  onRoleChange,
  onConfirm,
  isLastActiveAdmin,
}: BulkRoleDialogProps) {
  const showWarning = isLastActiveAdmin && currentRole !== "ADMIN"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-5" aria-hidden="true" />
            Ubah Role {selectedCount} User
          </DialogTitle>
          <DialogDescription>
            Pilih role baru untuk {selectedCount} user yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <Select
            value={currentRole}
            onValueChange={(v) => onRoleChange(v as Role)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrator</SelectItem>
              <SelectItem value="USER">Developer</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>

          {showWarning && (
            <p
              className="text-xs text-amber-600 dark:text-amber-400"
              role="alert"
            >
              ⚠ Tidak bisa mengubah role ADMIN terakhir.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={showWarning}>
            Ubah Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
