"use client"

import { useState } from "react"
import { Trash2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { MockUser } from "@/lib/mock-data"

interface DeleteUserDialogProps {
  user: MockUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmText, setConfirmText] = useState("")
  const [prevKey, setPrevKey] = useState<string | null>(null)

  const resetKey = open ? user?.id ?? null : null
  if (resetKey !== prevKey) {
    setPrevKey(resetKey)
    setStep(1)
    setConfirmText("")
  }

  if (!user) return null

  const canConfirm = confirmText === user.email

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md">
        {step === 1 ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <DialogHeader className="mt-4">
              <DialogTitle className="text-lg font-semibold">
                Hapus {user.name}?
              </DialogTitle>
              <DialogDescription>
                Tindakan ini tidak bisa dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-4 space-y-1.5 text-left text-sm text-muted-foreground">
              <li>
                • Semua project &amp; deployment milik user akan dipindahkan ke
                ADMIN.
              </li>
              <li>• API keys user akan direvoke.</li>
              <li>• Audit log tetap tersimpan.</li>
            </ul>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button variant="destructive" onClick={() => setStep(2)}>
                Lanjut
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (canConfirm) {
                onConfirm()
                handleClose()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Konfirmasi Hapus
              </DialogTitle>
              <DialogDescription>
                Ketik <strong>{user.email}</strong> untuk konfirmasi:
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.email}
                autoComplete="off"
                aria-label="Ketik email untuk konfirmasi"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canConfirm}
              >
                <Trash2 className="h-4 w-4" />
                Hapus Permanen
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
