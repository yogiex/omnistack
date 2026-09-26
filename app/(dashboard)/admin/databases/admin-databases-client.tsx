"use client"

import { useMemo } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getMockDatabasesForRole, type MockDatabase } from "@/lib/mock-data"

import { useDatabaseFilters } from "./_hooks/use-database-filters"
import { DatabasesEmptyState } from "./_components/databases-empty-state"
import { DatabasesHeader } from "./_components/databases-header"
import { DatabasesPagination } from "./_components/databases-pagination"
import { DatabasesSkeleton } from "./_components/databases-skeleton"
import { DatabasesTable } from "./_components/databases-table"
import { DatabasesToolbar } from "./_components/databases-toolbar"

export function AdminDatabasesClient() {
  const { user, isLoading } = useAuth()

  const databases = useMemo<MockDatabase[]>(() => {
    if (!user) return []
    return getMockDatabasesForRole(user.id, user.role)
  }, [user])

  const filters = useDatabaseFilters({ databases })

  // `useAuth` hydrate dari localStorage, jadi ada satu render dengan
  // `user === null`. Tanpa skeleton, layar kosong sedetik.
  if (isLoading || !user) return <DatabasesSkeleton />

  const { needsAttention } = filters

  return (
    <div className="flex flex-col gap-6">
      <DatabasesHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Database" value={filters.filtered.length} />
        <SummaryCard
          label="Total Storage"
          value={`${filters.totalStorageGb.toFixed(1)} GB`}
        />
        <SummaryCard
          label="Butuh Perhatian"
          value={needsAttention}
          tone={needsAttention > 0 ? "destructive" : "default"}
          hint={
            needsAttention > 0
              ? "Database non-sehat di hasil filter ini"
              : "Semua sehat"
          }
        />
      </div>

      <DatabasesToolbar
        search={filters.search}
        onSearchChange={filters.setSearch}
        projectFilter={filters.projectFilter}
        onProjectChange={filters.setProjectFilter}
        engineFilter={filters.engineFilter}
        onEngineChange={filters.setEngineFilter}
        statusFilter={filters.statusFilter}
        onStatusChange={filters.setStatusFilter}
      />

      <Card className="py-0">
        {filters.filtered.length === 0 ? (
          <DatabasesEmptyState
            hasFilters={filters.hasFilters}
            onClearFilters={filters.clearFilters}
          />
        ) : (
          <>
            <DatabasesTable databases={filters.paged} />
            <DatabasesPagination
              totalCount={filters.filtered.length}
              rangeStart={filters.rangeStart}
              rangeEnd={filters.rangeEnd}
              page={filters.page}
              totalPages={filters.totalPages}
              onPrev={() => filters.setPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                filters.setPage((p) => Math.min(filters.totalPages, p + 1))
              }
            />
          </>
        )}
      </Card>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string | number
  tone?: "default" | "destructive"
  hint?: string
}

function SummaryCard({
  label,
  value,
  tone = "default",
  hint,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-1 py-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={
            tone === "destructive"
              ? "text-2xl font-bold text-destructive tabular-nums"
              : "text-2xl font-bold tabular-nums"
          }
        >
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
