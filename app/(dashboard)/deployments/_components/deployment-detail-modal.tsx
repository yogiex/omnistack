"use client"

import {
  Clock,
  GitBranch,
  User,
  Rocket,
  CheckCircle2,
  XCircle,
  Loader2,
  Minus,
  Shield,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { cn } from "@/lib/utils"
import type { MockDeployment, PipelineStep } from "@/lib/mock-data"

interface DeploymentDetailModalProps {
  deployment: MockDeployment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  getProjectName: (projectId: string) => string
}

function PipelineStepIcon({ status }: { status: PipelineStep["status"] }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />
    case "pending":
      return <Minus className="h-4 w-4 text-muted-foreground" />
    case "skipped":
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

function getShortCommitHash(deploymentId: string): string {
  const seed = deploymentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return seed.toString(16).padStart(7, "0").slice(0, 7)
}

export function DeploymentDetailModal({
  deployment,
  open,
  onOpenChange,
  getProjectName,
}: DeploymentDetailModalProps) {
  if (!deployment) return null

  const pipeline = deployment.pipeline ?? []
  const completedSteps = pipeline.filter((s) => s.status === "success").length
  const totalSteps = pipeline.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Deployment Detail — {deployment.id}
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <DeploymentStatusBadge status={deployment.status} />
            <span className="font-medium">
              {getProjectName(deployment.projectId)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-xs">{deployment.branch}</span>
              <span>→</span>
              <Badge variant="outline" className="text-[10px]">
                {deployment.environment}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-xs">{deployment.triggeredBy}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{deployment.timeLabel}</span>
              {deployment.durationLabel && (
                <span>· {deployment.durationLabel}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rocket className="h-4 w-4" />
              <span className="text-xs">Trigger: {deployment.trigger}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            &ldquo;{deployment.commitMessage}&rdquo;
          </p>
        </div>

        {/* Pipeline Timeline */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Pipeline ({completedSteps}/{totalSteps} steps)</h4>
          <div className="space-y-0">
            {pipeline.map((step, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 border-l-2 py-3 pl-4",
                  step.status === "success" && "border-green-500",
                  step.status === "running" && "border-yellow-500",
                  step.status === "failed" && "border-destructive",
                  step.status === "pending" && "border-muted",
                  i === pipeline.length - 1 && "border-transparent"
                )}
              >
                <PipelineStepIcon status={step.status} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{step.name}</span>
                    {step.durationSeconds && (
                      <span className="text-xs text-muted-foreground">
                        {step.durationSeconds}s
                      </span>
                    )}
                  </div>
                  {step.status === "running" && (
                    <p className="mt-1 text-xs text-yellow-500">
                      In progress...
                    </p>
                  )}
                  {step.logs.length > 0 && (
                    <div className="mt-2 rounded bg-muted/50 p-2 font-mono text-[11px] text-muted-foreground">
                      {step.logs.slice(-3).map((log, j) => (
                        <p key={j}>{log}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commit Details */}
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium">Commit Details</h4>
          <div className="space-y-1 font-mono text-xs text-muted-foreground">
            <p>SHA: {getShortCommitHash(deployment.id)}</p>
            <p>Message: {deployment.commitMessage}</p>
            <p>Author: {deployment.triggeredBy}</p>
          </div>
        </div>

        {/* Health Check (placeholder) */}
        {deployment.status === "success" && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-green-500" />
              Health Check
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                HTTP 200 check: Passed
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Error rate: 0.0%
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Response p95: 142ms
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Memory: 62%
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
