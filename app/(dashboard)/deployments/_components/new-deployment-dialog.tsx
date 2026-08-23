"use client"

import { useState } from "react"
import { Rocket } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { MockProject } from "@/lib/mock-data"

interface NewDeploymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: MockProject[]
  onDeploy: (config: {
    projectId: string
    branch: string
    environment: string
  }) => void
}

export function NewDeploymentDialog({
  open,
  onOpenChange,
  projects,
  onDeploy,
}: NewDeploymentDialogProps) {
  const [projectId, setProjectId] = useState("")
  const [branch, setBranch] = useState("main")
  const [environment, setEnvironment] = useState("production")
  const [skipTests, setSkipTests] = useState(false)
  const [zeroDowntime, setZeroDowntime] = useState(true)

  const selectedProject = projects.find((p) => p.id === projectId)

  const handleDeploy = () => {
    if (!projectId) return
    onDeploy({ projectId, branch, environment })
    setProjectId("")
    setBranch("main")
    setEnvironment("production")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            New Deployment
          </DialogTitle>
          <DialogDescription>
            Trigger a new deployment for your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={projectId} onValueChange={(v) => setProjectId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Branch *</Label>
            <Select value={branch} onValueChange={(v) => setBranch(v ?? "main")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">main</SelectItem>
                <SelectItem value="develop">develop</SelectItem>
                <SelectItem value="feat/feature">feat/feature</SelectItem>
                <SelectItem value="hotfix/urgent">hotfix/urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Environment *</Label>
            <div className="flex gap-4">
              {["production", "staging", "preview"].map((env) => (
                <label key={env} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="environment"
                    value={env}
                    checked={environment === env}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="accent-primary"
                  />
                  {env === "production" ? "🌐" : "🔀"} {env}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="text-xs">Project: </span>
                <span className="font-medium text-foreground">
                  {selectedProject?.name ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-xs">Branch: </span>
                <span className="font-medium text-foreground">{branch}</span>
              </div>
              <div>
                <span className="text-xs">Environment: </span>
                <span className="font-medium text-foreground">{environment}</span>
              </div>
              <div>
                <span className="text-xs">Strategy: </span>
                <span className="font-medium text-foreground">
                  {zeroDowntime ? "Blue/Green" : "Rolling"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="skip-tests"
                checked={skipTests}
                onCheckedChange={(c) => setSkipTests(c === true)}
              />
              <Label htmlFor="skip-tests" className="text-sm">
                Skip tests (not recommended)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="zero-downtime"
                checked={zeroDowntime}
                onCheckedChange={(c) => setZeroDowntime(c === true)}
              />
              <Label htmlFor="zero-downtime" className="text-sm">
                Enable zero-downtime (Blue/Green)
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!projectId} onClick={handleDeploy}>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
