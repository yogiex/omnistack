"use client"

import { KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MockDatabase } from "@/lib/mock-data"

interface RotatePasswordDialogProps {
  database: MockDatabase | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function RotatePasswordDialog({
  database,
  open,
  onOpenChange,
  onConfirm,
}: RotatePasswordDialogProps) {
  if (!database) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <DialogTitle className="mt-4 text-lg font-semibold">
            Rotasi Password?
          </DialogTitle>
          <DialogDescription className="mt-2">
            Koneksi aktif menggunakan password lama akan terputus dan perlu
            diperbarui di aplikasi Anda.
          </DialogDescription>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Ya, Rotasi Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
