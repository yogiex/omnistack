"use client"

import Link from "next/link"
import {
  Archive,
  ArchiveRestore,
  Copy,
  MoreVertical,
  Pencil,
  Rocket,
  Trash2,
  UserRoundPlus,
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
import { Badge } from "@/components/ui/badge"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import {
  getProjectStackList,
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
            <TableHead className="w-12" />
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
                <TableCell>
                  {manageable ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-8 w-8 p-0"
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">
                          Aksi untuk {project.name}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => handlers.onDeploy(project)}
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Deploy
                        </DropdownMenuItem>
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
                          <DropdownMenuItem
                            onClick={() => handlers.onTransfer(project)}
                          >
                            <UserRoundPlus className="mr-2 h-4 w-4" />
                            Transfer Ownership
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {confirmDeleteId === project.id ? (
                          <>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handlers.onDelete(project)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Konfirmasi Hapus
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handlers.onCancelDelete}>
                              Batal
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handlers.onRequestDelete(project.id)
                            }
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Permanen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      View only
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
