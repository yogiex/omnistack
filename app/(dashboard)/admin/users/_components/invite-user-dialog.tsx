"use client"

import { useState } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: Role) => void
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  USER: "Developer dapat membuat dan mengelola proyeknya sendiri.",
  ADMIN: "Admin memiliki akses penuh termasuk manajemen user.",
  VIEWER: "Viewer hanya dapat melihat, tidak dapat mengubah apa pun.",
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "USER", label: "Developer (USER)" },
  { value: "ADMIN", label: "Admin (ADMIN)" },
  { value: "VIEWER", label: "Viewer (VIEWER)" },
]

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvite,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("USER")
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    setEmail("")
    setRole("USER")
  }

  const isValid = email.includes("@")

  const handleSubmit = () => {
    if (!isValid) return
    onInvite(email.trim(), role)
    setEmail("")
    setRole("USER")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Tim</DialogTitle>
          <DialogDescription>
            Kirim undangan email untuk bergabung ke OmniStack.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Alamat Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Tentukan Role <span className="text-destructive">*</span>
            </span>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className={cn(
                "text-xs text-muted-foreground",
                !isValid && "sr-only"
              )}
            >
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Kirim Undangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
