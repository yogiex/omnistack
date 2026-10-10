"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import type { Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: Role, message?: string) => void
  isEmailTaken: (email: string) => boolean
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Akses penuh ke sistem termasuk manajemen user.",
  USER: "Dapat membuat dan mengelola proyeknya sendiri.",
  VIEWER: "Hanya dapat melihat, tidak dapat mengubah apa pun.",
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "ADMIN", label: "Administrator" },
  { value: "USER", label: "Developer" },
  { value: "VIEWER", label: "Viewer" },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvite,
  isEmailTaken,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("USER")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setEmail("")
      setRole("USER")
      setMessage("")
      setIsSubmitting(false)
    }
  }

  const trimmedEmail = email.trim()
  const emailValid = EMAIL_PATTERN.test(trimmedEmail)
  const emailTaken = emailValid && isEmailTaken(trimmedEmail)
  const canSubmit = emailValid && !emailTaken && !isSubmitting

  const emailError = !trimmedEmail
    ? null
    : !emailValid
      ? "Format email tidak valid"
      : emailTaken
        ? "Email sudah terdaftar di sistem"
        : null

  const handleSubmit = () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    onInvite(trimmedEmail, role, message.trim() || undefined)
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
              aria-invalid={emailError ? true : undefined}
            />
            {emailError && (
              <p className="text-xs text-destructive" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Tentukan Role <span className="text-destructive">*</span>
            </span>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
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
                !canSubmit && "sr-only",
              )}
            >
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-message" className="text-sm font-medium">
              Pesan <span className="text-muted-foreground">(opsional)</span>
            </label>
            <Textarea
              id="invite-message"
              rows={3}
              placeholder="Tambahkan pesan untuk penerima undangan…"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {isSubmitting && (
              <Loader2
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            Kirim Undangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
