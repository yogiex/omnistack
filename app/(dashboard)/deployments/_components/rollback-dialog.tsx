"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface RollbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deploymentId: string
  projectName: string
  onConfirm: (reason: string) => void
}

export function RollbackDialog({
  open,
  onOpenChange,
  deploymentId,
  projectName,
  onConfirm,
}: RollbackDialogProps) {
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    onConfirm(reason)
    setReason("")
    setConfirmed(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Rollback Deployment
          </DialogTitle>
          <DialogDescription>
            Anda akan melakukan rollback untuk deployment ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Project: </span>
                <span className="font-medium">{projectName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Deployment: </span>
                <span className="font-mono text-xs">{deploymentId}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollback-reason">Alasan rollback (opsional)</Label>
            <Textarea
              id="rollback-reason"
              placeholder="Jelaskan alasan rollback..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="rollback-confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="rollback-confirm" className="text-sm">
              Saya memahami dampak dari rollback ini
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!confirmed}
            onClick={handleConfirm}
          >
            Confirm Rollback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
