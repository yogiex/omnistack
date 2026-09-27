"use client"

import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MOCK_USERS } from "@/lib/mock-data"
import type { ErrorStatus, TrackedError } from "@/lib/mock-errors"
import { cn } from "@/lib/utils"

import { ErrorAssignMenu } from "./error-assign-menu"
import { ErrorSeverityBadge } from "./error-severity-badge"
import { ErrorStatusBadge } from "./error-status-badge"

const detailId = (errorId: string) => `error-detail-${errorId}`

const ASSIGNEE_NAMES = new Map(MOCK_USERS.map((u) => [u.id, u.name]))

interface ErrorRowProps {
  error: TrackedError
  expanded: boolean
  onToggle: () => void
  canWrite: boolean
  onUpdateStatus: (id: string, status: ErrorStatus) => void
  onAssign: (id: string, userId: string) => void
  onUnassign: (id: string) => void
}

export function ErrorRow({
  error,
  expanded,
  onToggle,
  canWrite,
  onUpdateStatus,
  onAssign,
  onUnassign,
}: ErrorRowProps) {
  const assigneeName = error.assigneeId
    ? ASSIGNEE_NAMES.get(error.assigneeId)
    : undefined

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        expanded && "bg-muted/30",
      )}
    >
      {/*
        Baris summary adalah satu `<button>` penuh dengan `aria-expanded` +
        `aria-controls` yang menunjuk panel detail di bawah. Versi
        sebelumnya tidak punya keduanya, jadi screen reader tidak memberi
        tahu apa yang sedang dibuka.
      */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId(error.id)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/20 focus-visible:bg-muted/30 focus-visible:outline-none"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <ErrorStatusBadge status={error.status} />
            <ErrorSeverityBadge severity={error.severity} />
            <span className="text-xs text-muted-foreground tabular-nums">
              ×{error.count.toLocaleString("id-ID")}
            </span>
            {assigneeName && (
              <span className="truncate text-xs text-muted-foreground">
                → {assigneeName}
              </span>
            )}
          </div>
          <p className="truncate font-mono text-sm font-medium">
            {error.message}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {error.stackSnippet}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-muted-foreground">{error.project}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {error.affectedUsers.toLocaleString("id-ID")} pengguna
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </button>

      {expanded && (
        <div
          id={detailId(error.id)}
          className="space-y-4 border-t px-4 pt-3 pb-4"
        >
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Proyek</p>
              <p className="mt-0.5 font-medium">{error.project}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pertama Terlihat</p>
              <p className="mt-0.5 font-medium">{error.firstSeen}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terakhir Terlihat</p>
              <p className="mt-0.5 font-medium">{error.lastSeen}</p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Stack Trace
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {error.fullStack}
            </pre>
          </div>

          <div className="rounded-lg border-l-2 border-l-primary bg-primary/5 p-3">
            <p className="mb-1 text-xs font-medium text-primary">
              Saran Perbaikan
            </p>
            <p className="text-sm leading-relaxed">{error.suggestedFix}</p>
          </div>

          {canWrite && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {error.status !== "Investigating" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(error.id, "Investigating")}
                >
                  Tandai Investigating
                </Button>
              )}
              {error.status !== "Resolved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(error.id, "Resolved")}
                >
                  Tandai Resolved
                </Button>
              )}
              <ErrorAssignMenu
                errorId={error.id}
                currentAssigneeId={error.assigneeId}
                onAssign={onAssign}
                onUnassign={onUnassign}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
