"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNotice } from "@/hooks/use-notice"
import { useAuth } from "@/lib/auth-context"
import { MOCK_USERS } from "@/lib/mock-data"
import type { ErrorStatus } from "@/lib/mock-errors"

import { useErrorFilters } from "./_hooks/use-error-filters"
import { useErrors } from "./_hooks/use-errors"
import { ErrorEmptyState } from "./_components/error-empty-state"
import { ErrorFilterBar } from "./_components/error-filter-bar"
import { ErrorHeader } from "./_components/error-header"
import { ErrorRow } from "./_components/error-row"
import { ErrorTrackingSkeleton } from "./_components/error-skeleton"
import { ErrorStatsCards } from "./_components/error-stats-cards"

const USER_NAMES = new Map(MOCK_USERS.map((u) => [u.id, u.name]))

export function ErrorTrackingClient() {
  const { user, isLoading } = useAuth()
  const { notice, showNotice } = useNotice()

  // VIEWER boleh membaca error, tidak boleh mengubah status/assignee.
  const canWrite = user?.role === "ADMIN" || user?.role === "USER"

  const { errors, stats, updateStatus, assignTo, unassign } = useErrors({
    canWrite,
  })
  const filters = useErrorFilters({ errors })

  // Hanya satu baris yang boleh terbuka — `null` berarti semua tertutup.
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ------------------------------------------------------------------ */
  /*  Handlers — hasil mutasi selalu dicek, guard-nya di hook            */
  /* ------------------------------------------------------------------ */

  const handleUpdateStatus = (id: string, status: ErrorStatus) => {
    if (!updateStatus(id, status)) {
      showNotice("Perubahan ditolak — akun kamu tidak punya izin tulis.")
      return
    }
    showNotice(`Error ditandai sebagai ${status}.`)
  }

  const handleAssign = (id: string, userId: string) => {
    if (!assignTo(id, userId)) {
      showNotice("Assignment ditolak — akun kamu tidak punya izin tulis.")
      return
    }
    showNotice(`Error di-assign ke ${USER_NAMES.get(userId) ?? userId}.`)
  }

  const handleUnassign = (id: string) => {
    if (!unassign(id)) {
      showNotice("Assignment ditolak — akun kamu tidak punya izin tulis.")
      return
    }
    showNotice("Assignee dilepas.")
  }

  if (isLoading || !user) return <ErrorTrackingSkeleton />

  return (
    <main className="flex flex-col gap-6">
      <ErrorHeader />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </div>
      )}

      <ErrorStatsCards stats={stats} />

      <Card>
        <CardContent className="pt-6">
          <ErrorFilterBar
            search={filters.search}
            onSearchChange={filters.setSearch}
            projectFilter={filters.projectFilter}
            onProjectChange={filters.setProjectFilter}
            statusFilter={filters.statusFilter}
            onStatusChange={filters.setStatusFilter}
            severityFilter={filters.severityFilter}
            onSeverityChange={filters.setSeverityFilter}
            resultCount={filters.filtered.length}
            totalCount={errors.length}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Error ({filters.filtered.length})</CardTitle>
          <CardDescription>
            Klik baris untuk melihat stack trace lengkap dan saran perbaikan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filters.filtered.length === 0 ? (
            <ErrorEmptyState
              hasFilters={filters.hasFilters}
              onClearFilters={filters.reset}
            />
          ) : (
            <div className="space-y-3">
              {filters.filtered.map((error) => (
                <ErrorRow
                  key={error.id}
                  error={error}
                  expanded={expandedId === error.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === error.id ? null : error.id))
                  }
                  canWrite={canWrite}
                  onUpdateStatus={handleUpdateStatus}
                  onAssign={handleAssign}
                  onUnassign={handleUnassign}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
