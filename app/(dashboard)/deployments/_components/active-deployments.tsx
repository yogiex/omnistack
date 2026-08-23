"use client"

import { useEffect, useState } from "react"
import { Ban, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MockDeployment, PipelineStep } from "@/lib/mock-data"

interface ActiveDeploymentsProps {
  deployments: MockDeployment[]
  isViewer: boolean
  onCancel: (id: string) => void
  getProjectName: (projectId: string) => string
}

function PipelineStepIcon({ status }: { status: PipelineStep["status"] }) {
  switch (status) {
    case "success":
      return <span className="text-green-500">✓</span>
    case "running":
      return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
    case "failed":
      return <span className="text-destructive">✗</span>
    case "pending":
      return <span className="text-muted-foreground">⏸</span>
    case "skipped":
      return <span className="text-muted-foreground">—</span>
  }
}

function PipelineProgress({ pipeline }: { pipeline: PipelineStep[] }) {
  const completed = pipeline.filter((s) => s.status === "success").length
  const total = pipeline.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {pipeline.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <PipelineStepIcon status={step.status} />
            <span
              className={cn(
                step.status === "running" && "font-medium text-foreground",
                step.status === "success" && "text-muted-foreground",
                step.status === "failed" && "text-destructive",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.name}
            </span>
            {step.durationSeconds && step.status === "success" && (
              <span className="text-muted-foreground">
                ({step.durationSeconds}s)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActiveDeployments({
  deployments,
  isViewer,
  onCancel,
  getProjectName,
}: ActiveDeploymentsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    deployments[0]?.id ?? null
  )

  // Auto-refresh simulation — tick forces re-render
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])

  const activeDeployments = deployments.filter(
    (d) => d.status === "building" || d.status === "queued"
  )

  if (activeDeployments.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Active Deployments
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {activeDeployments.length}
              </span>
            </CardTitle>
            <CardDescription>Auto-refresh setiap 10 detik</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Live
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDeployments.map((deployment) => (
          <div
            key={deployment.id}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium">
                    {getProjectName(deployment.projectId)}
                  </h4>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {deployment.id}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {deployment.branch} → {deployment.environment}
                  <span className="mx-1.5">·</span>
                  by {deployment.triggeredBy}
                </p>
              </div>
              {!isViewer && deployment.status === "building" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs text-destructive hover:text-destructive"
                  onClick={() => onCancel(deployment.id)}
                >
                  <Ban className="mr-1 h-3 w-3" />
                  Cancel
                </Button>
              )}
            </div>

            <div className="mt-3">
              <PipelineProgress pipeline={deployment.pipeline} />
            </div>

            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                setExpandedId(expandedId === deployment.id ? null : deployment.id)
              }
            >
              {expandedId === deployment.id ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expandedId === deployment.id ? "Hide" : "Show"} steps
            </button>

            {expandedId === deployment.id && (
              <div className="mt-3 space-y-2 rounded-md bg-muted/50 p-3">
                {deployment.pipeline.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <PipelineStepIcon status={step.status} />
                      <span
                        className={cn(
                          step.status === "running" && "font-medium",
                          step.status === "failed" && "text-destructive"
                        )}
                      >
                        {step.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {step.durationSeconds && (
                        <span>{step.durationSeconds}s</span>
                      )}
                      {step.status === "running" && (
                        <span className="text-yellow-500">In progress...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
