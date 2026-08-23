"use client"

import Link from "next/link"
import {
  Activity,
  Archive,
  ArchiveRestore,
  Copy,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Play,
  Rocket,
  RotateCcw,
  Square,
  Trash2,
  UserRoundPlus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import {
  getProjectStackList,
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
        "relative flex flex-col transition-shadow hover:shadow-lg",
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
            <p className="mt-1 text-red-500">{project.errorMessage}</p>
          )}
        </div>

        {project.status === "deploying" &&
          typeof project.progress === "number" && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-yellow-500 transition-all"
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
          {manageable &&
            (isConfirmingDelete ? (
              <span className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!canDelete}
                  onClick={() => handlers.onDelete(project)}
                >
                  Ya, Hapus
                </Button>
                <Button variant="ghost" size="sm" onClick={handlers.onCancelDelete}>
                  Batal
                </Button>
              </span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 w-8 p-0"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Aksi untuk {project.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => handlers.onEdit(project)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlers.onToggleArchive(project)}
                  >
                    {project.archived ? (
                      <>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Unarchive
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlers.onClone(project)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Clone
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => handlers.onTransfer(project)}>
                      <UserRoundPlus className="mr-2 h-4 w-4" />
                      Transfer Ownership
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handlers.onRequestDelete(project.id)}
                    disabled={!canDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Permanen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
        </div>
        )}
      </CardFooter>
    </Card>
  )
}
