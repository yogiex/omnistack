"use client"

import { useMemo } from "react"

import { Card } from "@/components/ui/card"
import { StatCard, StatGrid } from "@/components/stat-card"
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

      <StatGrid cols={3}>
        <StatCard
          title="Total Database"
          value={filters.filtered.length}
          hint={
            filters.filtered.length === filters.totalCount
              ? "Seluruh database"
              : `dari ${filters.totalCount} total`
          }
        />
        <StatCard
          title="Total Storage"
          value={`${filters.totalStorageGb.toFixed(1)} GB`}
        />
        <StatCard
          title="Butuh Perhatian"
          value={needsAttention}
          valueClassName={needsAttention > 0 ? "text-destructive" : undefined}
          hint={
            needsAttention > 0
              ? "Database non-sehat di hasil filter ini"
              : "Semua sehat"
          }
        />
      </StatGrid>

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
