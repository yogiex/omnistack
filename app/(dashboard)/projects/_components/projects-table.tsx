"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { ProjectActionsMenu } from "./project-actions-menu"
import {
  getProjectStackList,
  MOCK_COST_BREAKDOWN,
  MOCK_USERS,
  type MockProject,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type {
  ManagedProject,
  ProjectCardHandlers,
} from "./project-card"

interface ProjectsTableProps {
  projects: ManagedProject[]
  canManageProject: (project: MockProject) => boolean
  isAdmin: boolean
  confirmDeleteId: string | null
  handlers: ProjectCardHandlers
}

export function ProjectsTable({
  projects,
  canManageProject,
  isAdmin,
  confirmDeleteId,
  handlers,
}: ProjectsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Stack</TableHead>
            <TableHead className="hidden sm:table-cell">Updated</TableHead>
            <TableHead className="hidden sm:table-cell">FinOps</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Aksi</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const manageable = canManageProject(project)
            const stack = getProjectStackList(project)

            return (
              <TableRow
                key={project.id}
                className={cn(project.archived && "opacity-60")}
              >
                <TableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {project.description}
                  </p>
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {stack.slice(0, 2).map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {stack.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{stack.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {project.lastDeployLabel ?? project.createdAtLabel}
                  {isAdmin && (
                    <span className="block">
                      Pemilik:{" "}
                      {MOCK_USERS.find((u) => u.id === project.userId)?.name ??
                        "Unknown"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                  {(() => {
                    const cost = MOCK_COST_BREAKDOWN.find((c) => c.projectId === project.id)
                    return cost ? `$${cost.thisMonth.toFixed(2)}/mo` : "—"
                  })()}
                </TableCell>
                <TableCell>
                  <ProjectActionsMenu
                    project={project}
                    manageable={manageable}
                    isAdmin={isAdmin}
                    confirmDeleteId={confirmDeleteId}
                    handlers={handlers}
                    showDeploy
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
