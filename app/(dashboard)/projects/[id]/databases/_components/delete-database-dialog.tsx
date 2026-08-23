"use client"

import { useState } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { MockDatabase } from "@/lib/mock-data"

interface DeleteDatabaseDialogProps {
  database: MockDatabase | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteDatabaseDialog({
  database,
  open,
  onOpenChange,
  onConfirm,
}: DeleteDatabaseDialogProps) {
  const [inputValue, setInputValue] = useState("")
  const [prevKey, setPrevKey] = useState<string | null>(null)

  const resetKey = open ? (database?.id ?? null) : null
  if (resetKey !== prevKey) {
    setPrevKey(resetKey)
    setInputValue("")
  }

  if (!database) return null

  const confirmToken = database.name.toLowerCase()

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
              Hapus Database?
            </DialogTitle>
            <DialogDescription className="mt-2">
              Tindakan ini tidak dapat dibatalkan. Database &quot;
              {database.name}&quot; beserta semua data dan backup-nya akan
              dihapus permanen.
            </DialogDescription>
          </div>
          <div className="mt-4 space-y-2">
            <label
              htmlFor="delete-database-confirm"
              className="text-sm font-medium text-foreground"
            >
              Ketik &quot;{confirmToken}&quot; untuk konfirmasi:
            </label>
            <Input
              id="delete-database-confirm"
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
            <Button
              type="submit"
              variant="destructive"
              disabled={inputValue !== confirmToken}
            >
              Hapus Permanen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
