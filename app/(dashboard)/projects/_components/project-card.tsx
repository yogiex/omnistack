"use client"

import Link from "next/link"
import {
  Activity,
  Archive,
  Eye,
  FileText,
  Play,
  Rocket,
  RotateCcw,
  Square,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { ProjectActionsMenu } from "./project-actions-menu"
import {
  getProjectStackList,
  MOCK_COST_BREAKDOWN,
  type MockProject,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export interface ManagedProject extends MockProject {
  archived?: boolean
}

export interface ProjectCardHandlers {
  onDeploy: (project: ManagedProject) => void
  onPause: (project: ManagedProject) => void
  onStart: (project: ManagedProject) => void
  onRetry: (project: ManagedProject) => void
  onEdit: (project: ManagedProject) => void
  onToggleArchive: (project: ManagedProject) => void
  onClone: (project: ManagedProject) => void
  onTransfer: (project: ManagedProject) => void
  onRequestDelete: (projectId: string) => void
  onCancelDelete: () => void
  onDelete: (project: ManagedProject) => void
}

interface ProjectCardProps {
  project: ManagedProject
  manageable: boolean
  canDelete: boolean
  isAdmin: boolean
  isConfirmingDelete: boolean
  ownerName?: string
  ownerEmail?: string
  viewerMode?: boolean
  handlers: ProjectCardHandlers
}

export function ProjectCard({
  project,
  manageable,
  canDelete,
  isAdmin,
  isConfirmingDelete,
  ownerName,
  ownerEmail,
  viewerMode = false,
  handlers,
}: ProjectCardProps) {
  const stack = getProjectStackList(project)

  const primaryAction = () => {
    switch (project.status) {
      case "active":
        return (
          <Button size="sm" onClick={() => handlers.onDeploy(project)}>
            <Rocket className="mr-1 h-3 w-3" />
            Deploy
          </Button>
        )
      case "deploying":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlers.onPause(project)}
          >
            <Square className="mr-1 h-3 w-3" />
            Pause
          </Button>
        )
      case "failed":
        return (
          <Button size="sm" onClick={() => handlers.onRetry(project)}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )
      case "inactive":
        return (
          <Button size="sm" onClick={() => handlers.onStart(project)}>
            <Play className="mr-1 h-3 w-3" />
            Start
          </Button>
        )
    }
  }

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg",
        project.archived && "opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-3">
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.lastDeployLabel && (
              <span>Last deploy: {project.lastDeployLabel}</span>
            )}
          </div>
          {project.url && (
            <p className="mt-1 truncate font-mono text-[11px]">{project.url}</p>
          )}
          {project.status === "failed" && project.errorMessage && (
            <p className="mt-1 text-destructive">{project.errorMessage}</p>
          )}
        </div>

        {project.status === "deploying" &&
          typeof project.progress === "number" && (
            <div className="space-y-1">
              <div
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Deploy progress: ${project.progress}%`}
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground tabular-nums">
                {project.progress}%
              </p>
            </div>
          )}

        {isAdmin && ownerName && (
          <p className="text-xs text-muted-foreground">
            Pemilik: {ownerName}
          </p>
        )}
        {viewerMode && ownerEmail && (
          <p className="text-xs text-muted-foreground">
            Owner: {ownerEmail}
          </p>
        )}
        {project.archived && (
          <Badge variant="outline" className="w-fit gap-1.5 text-muted-foreground">
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        )}
        {(() => {
          const cost = MOCK_COST_BREAKDOWN.find((c) => c.projectId === project.id)
          return cost ? (
            <p className="text-xs font-medium text-muted-foreground">
              ${cost.thisMonth.toFixed(2)}/mo
            </p>
          ) : null
        })()}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t bg-muted/20 py-3 text-xs text-muted-foreground">
        <span>{project.deployments} deployment</span>
        {viewerMode ? (
          <div className="flex items-center gap-1">
            <Link
              href={`/projects/${project.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-2 text-xs"
              )}
            >
              <Eye className="mr-1 h-3 w-3" />
              Detail
            </Link>
            <Link
              href="/deployments"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-xs"
              )}
            >
              <FileText className="mr-1 h-3 w-3" />
              Logs
            </Link>
            <Link
              href="/monitoring"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-xs"
              )}
            >
              <Activity className="mr-1 h-3 w-3" />
              Metrik
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href={`/projects/${project.id}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-xs"
              )}
            >
              <Eye className="mr-1 h-3 w-3" />
              View
            </Link>
            {(manageable || project.status !== "inactive") &&
              primaryAction()}
          {manageable && (
            <ProjectActionsMenu
              project={project}
              manageable={manageable}
              isAdmin={isAdmin}
              confirmDeleteId={isConfirmingDelete ? project.id : null}
              handlers={handlers}
            />
          )}
        </div>
        )}
      </CardFooter>
    </Card>
  )
}
