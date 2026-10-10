"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus {selectedCount} User?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan. Semua project &amp; deployment
            milik user akan dipindahkan ke ADMIN.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus {selectedCount} User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
