"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
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
import { MOCK_USERS } from "@/lib/mock-data"

interface TransferOwnershipSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  currentOwnerId: string
  onSubmit: (newOwnerId: string) => void
}

export function TransferOwnershipSheet({
  open,
  onOpenChange,
  projectName,
  currentOwnerId,
  onSubmit,
}: TransferOwnershipSheetProps) {
  // Tidak ada efek reset: parent me-remount sheet ini per proyek
  // (`transferProject && …`), jadi state lokal otomatis bersih.
  const [owner, setOwner] = useState(currentOwnerId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Transfer Ownership</SheetTitle>
          <SheetDescription>
            Pilih pemilik baru untuk proyek{" "}
            <span className="font-medium text-foreground">{projectName}</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-owner">Pemilik Baru</Label>
            <Select
              value={owner}
              onValueChange={(v) => {
                if (v !== null) setOwner(v)
              }}
            >
              <SelectTrigger id="transfer-owner" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_USERS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Setelah transfer, Anda kehilangan aksi kepemilikan pada proyek ini
            (mock — perubahan hanya tersimpan selama sesi ini).
          </p>
        </div>

        <SheetFooter>
          <Button
            onClick={() => onSubmit(owner)}
            disabled={!owner || owner === currentOwnerId}
          >
            Transfer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
