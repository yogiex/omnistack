"use client"

import {
  ExternalLink,
  GitBranch,
  MoreVertical,
  RotateCcw,
  Rocket,
  Bug,
  Eye,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { cn } from "@/lib/utils"
import type { MockDeployment } from "@/lib/mock-data"

interface DeploymentsTableProps {
  deployments: MockDeployment[]
  isViewer: boolean
  getProjectName: (projectId: string) => string
  onViewLogs: (id: string) => void
  onViewDetail: (id: string) => void
  onRollback: (id: string) => void
  onRetry: (id: string) => void
  onAIDiagnose: (id: string) => void
}

const EFFECTIVE_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  rolled_back: {
    label: "Rolled Back",
    className: "text-blue-500 border-blue-500/40 bg-blue-500/10",
    dot: "bg-blue-500",
  },
}

function EffectiveStatusBadge({ status }: { status: string }) {
  const custom = EFFECTIVE_STATUS_CONFIG[status]
  if (custom) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
          custom.className
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", custom.dot)} />
        {custom.label}
      </span>
    )
  }
  return <DeploymentStatusBadge status={status as "success" | "building" | "failed" | "queued"} />
}

function getShortCommitHash(deploymentId: string): string {
  const seed = deploymentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return seed.toString(16).padStart(7, "0").slice(0, 7)
}

export function DeploymentsTable({
  deployments,
  isViewer,
  getProjectName,
  onViewLogs,
  onViewDetail,
  onRollback,
  onRetry,
  onAIDiagnose,
}: DeploymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="hidden md:table-cell">Commit</TableHead>
            <TableHead className="hidden lg:table-cell">Branch</TableHead>
            <TableHead className="hidden lg:table-cell">Env</TableHead>
            <TableHead className="hidden sm:table-cell">Author</TableHead>
            <TableHead className="hidden sm:table-cell">Duration</TableHead>
            <TableHead className="hidden sm:table-cell">When</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => {
            const effectiveStatus =
              deployment.status === "success" &&
              deployment.logLines.some((l) => l.includes("Rollback"))
                ? "rolled_back"
                : deployment.status

            return (
              <TableRow key={deployment.id}>
                <TableCell>
                  <EffectiveStatusBadge status={effectiveStatus} />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onViewDetail(deployment.id)}
                    className="font-medium hover:underline"
                  >
                    {getProjectName(deployment.projectId)}
                  </button>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {deployment.commitMessage}
                  </p>
                </TableCell>
                <TableCell className="hidden font-mono text-xs md:table-cell">
                  <span className="rounded bg-muted px-1 py-0.5">
                    {getShortCommitHash(deployment.id)}
                  </span>
                </TableCell>
                <TableCell className="hidden text-xs lg:table-cell">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                    {deployment.branch}
                  </span>
                </TableCell>
                <TableCell className="hidden text-xs lg:table-cell">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      deployment.environment === "production" &&
                        "bg-green-500/10 text-green-600",
                      deployment.environment === "staging" &&
                        "bg-yellow-500/10 text-yellow-600",
                      deployment.environment === "preview" &&
                        "bg-blue-500/10 text-blue-600"
                    )}
                  >
                    {deployment.environment === "production"
                      ? "🌐 production"
                      : deployment.environment === "staging"
                        ? "🔀 staging"
                        : "🔀 preview"}
                  </span>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {deployment.triggeredBy}
                </TableCell>
                <TableCell className="hidden text-xs tabular-nums text-muted-foreground sm:table-cell">
                  {deployment.durationLabel ?? "—"}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {deployment.timeLabel}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-8 w-8 p-0"
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">
                        Actions for {deployment.id}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => onViewLogs(deployment.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onViewDetail(deployment.id)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!isViewer && (
                        <>
                          {deployment.status === "failed" && (
                            <DropdownMenuItem
                              onClick={() => onRetry(deployment.id)}
                            >
                              <Rocket className="mr-2 h-4 w-4" />
                              Retry
                            </DropdownMenuItem>
                          )}
                          {deployment.status === "failed" && (
                            <DropdownMenuItem
                              onClick={() => onAIDiagnose(deployment.id)}
                            >
                              <Bug className="mr-2 h-4 w-4" />
                              AI Diagnose
                            </DropdownMenuItem>
                          )}
                          {deployment.status !== "building" &&
                            deployment.status !== "queued" && (
                              <DropdownMenuItem
                                onClick={() => onRollback(deployment.id)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Rollback
                              </DropdownMenuItem>
                            )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
