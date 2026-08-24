"use client"

import { useState } from "react"
import {
  CircleCheck,
  CircleX,
  TriangleAlert,
  GitBranch,
  Server,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEPLOY_CHECKLIST,
  IDE_BRANCH,
  IDE_NODE,
} from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

interface IdeDeployDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  canWrite: boolean
}

export function IdeDeployDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  canWrite,
}: IdeDeployDialogProps) {
  const [target, setTarget] = useState("Production")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deploy: {projectName}</DialogTitle>
          <DialogDescription>
            Jalankan deployment dari dalam editor. Mock — tidak memicu proses nyata.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-xs">{IDE_BRANCH}</span>
          <Badge variant="outline" className="ml-auto">locked</Badge>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Target</label>
          <div className="flex gap-2">
            {["Production", "Preview", "Staging"].map((t) => (
              <button
                key={t}
                type="button"
                disabled={!canWrite}
                onClick={() => setTarget(t)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm",
                  target === t
                    ? "border-primary/50 bg-primary/10 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Node (BYOC)</label>
          <Select defaultValue={IDE_NODE.id}>
            <SelectTrigger aria-label="Pilih node" disabled={!canWrite}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IDE_NODE.id}>
                {IDE_NODE.id} · healthy · {IDE_NODE.cpuPercent}% CPU · {IDE_NODE.region}
              </SelectItem>
              <SelectItem value="hetzner-02">hetzner-02 · healthy · 12% CPU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Server className="h-3.5 w-3.5" />
            Pre-deploy checklist
          </p>
          {DEPLOY_CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              {item.ok ? (
                <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span
                className={cn(
                  "truncate",
                  !item.ok && "text-amber-600"
                )}
              >
                {item.label}
              </span>
              {item.time && (
                <span className="ml-auto text-muted-foreground">({item.time})</span>
              )}
              {!item.ok && (
                <button type="button" className="ml-auto text-primary">
                  view
                </button>
              )}
            </div>
          ))}
        </div>

        <DialogFooter showCloseButton>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled={!canWrite}>
            <CircleX className="mr-1.5 h-4 w-4" />
            Deploy Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
