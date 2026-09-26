"use client"

import { useCallback, useMemo, useState } from "react"

import type { ManagedProject } from "../_components/project-card"
import type { ProjectView, SortKey } from "../_components/filter-bar"

export type StatusFilter =
  | "all"
  | "active"
  | "deploying"
  | "failed"
  | "inactive"
  | "archived"

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Live" },
  { value: "deploying", label: "Building" },
  { value: "failed", label: "Failed" },
  { value: "inactive", label: "Stopped" },
  { value: "archived", label: "Archived" },
]

const PAGE_SIZE = 6

interface UseProjectFiltersArgs {
  projects: ManagedProject[]
  isAdmin: boolean
}

/**
 * State filter/search/sort/pagination untuk daftar proyek.
 * Belum disinkronkan ke URL (butuh `useSearchParams` + `router.replace`) —
 * lihat "Belum di-refactor" di docs/audits/PROJECT-AUDIT.md.
 */
export function useProjectFilters({
  projects,
  isAdmin,
}: UseProjectFiltersArgs) {
  const [searchQuery, setSearchQueryRaw] = useState("")
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>("all")
  const [ownerFilter, setOwnerFilterRaw] = useState<string>("all")
  const [sortKey, setSortKeyRaw] = useState<SortKey>("updated")
  const [view, setView] = useState<ProjectView>("grid")
  const [currentPage, setCurrentPage] = useState(1)

  // Setiap perubahan filter memaksa balik ke halaman 1 — daripada efek
  // reset, setter dibungkus supaya tidak ada render berantai.
  const goToFirstPage = () => setCurrentPage(1)

  const setSearchQuery = useCallback(
    (value: string) => {
      setSearchQueryRaw(value)
      goToFirstPage()
    },
    []
  )

  const setStatusFilter = useCallback((value: StatusFilter) => {
    setStatusFilterRaw(value)
    goToFirstPage()
  }, [])

  const setOwnerFilter = useCallback((value: string) => {
    setOwnerFilterRaw(value)
    goToFirstPage()
  }, [])

  const setSortKey = useCallback((value: SortKey) => {
    setSortKeyRaw(value)
    goToFirstPage()
  }, [])

  const filtered = useMemo(() => {
    let result = projects

    if (statusFilter === "archived") {
      result = result.filter((p) => p.archived)
    } else if (statusFilter !== "all") {
      result = result.filter((p) => !p.archived && p.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (isAdmin && ownerFilter !== "all") {
      result = result.filter((p) => p.userId === ownerFilter)
    }

    switch (sortKey) {
      case "name":
        return [...result].sort((a, b) => a.name.localeCompare(b.name))
      case "created":
        // createdAtLabel cuma label ("2 hari lalu"), jadi urutan asli
        // dipakai sebagai proxy tanggal buat.
        return [...result].reverse()
      case "updated":
      default:
        return [...result].sort((a, b) => b.deployments - a.deployments)
    }
  }, [projects, statusFilter, searchQuery, ownerFilter, sortKey, isAdmin])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE)

  const reset = useCallback(() => {
    setSearchQueryRaw("")
    setStatusFilterRaw("all")
    setOwnerFilterRaw("all")
    goToFirstPage()
  }, [])

  return {
    searchQuery,
    statusFilter,
    ownerFilter,
    sortKey,
    view,
    currentPage: safePage,
    setSearchQuery,
    setStatusFilter,
    setOwnerFilter,
    setSortKey,
    setView,
    setCurrentPage,
    filtered,
    visible,
    totalPages,
    startIdx,
    endIdx: Math.min(startIdx + PAGE_SIZE, filtered.length),
    PAGE_SIZE,
    reset,
  }
}
