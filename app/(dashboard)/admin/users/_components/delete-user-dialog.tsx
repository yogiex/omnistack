"use client"

import { useState } from "react"
import { Trash2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [inputValue, setInputValue] = useState("")
  const [prevKey, setPrevKey] = useState<string | null>(null)

  const resetKey = open ? user?.id ?? null : null
  if (resetKey !== prevKey) {
    setPrevKey(resetKey)
    setInputValue("")
  }

  const confirmToken = user ? user.name.split(" ")[0].toLowerCase() : ""

  if (!user) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inputValue === confirmToken) {
      onConfirm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="mt-4 text-lg font-semibold">
              Hapus User?
            </DialogTitle>
            <DialogDescription className="mt-2">
              Tindakan ini tidak dapat dibatalkan. User &quot;{user.name}&quot;
              dan semua sesi aktifnya akan dihapus permanen.
            </DialogDescription>
          </div>
          <div className="mt-4 space-y-2">
            <label
              htmlFor="delete-user-confirm"
              className="text-sm font-medium text-foreground"
            >
              Ketik &quot;{confirmToken}&quot; untuk konfirmasi:
            </label>
            <Input
              id="delete-user-confirm"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={confirmToken}
              autoComplete="off"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={inputValue !== confirmToken}>
              <Trash2 className="h-4 w-4" />
              Hapus Permanen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
