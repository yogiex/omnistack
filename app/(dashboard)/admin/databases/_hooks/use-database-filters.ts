"use client"

import { useCallback, useMemo, useState } from "react"

import type {
  DatabaseEngine,
  DatabaseStatus,
  MockDatabase,
} from "@/lib/mock-data"

export type ProjectFilter = string | "ALL"
export type EngineFilter = DatabaseEngine | "ALL"
export type StatusFilter = DatabaseStatus | "ALL"

const PAGE_SIZE = 10

interface UseDatabaseFiltersArgs {
  databases: MockDatabase[]
}

export function useDatabaseFilters({ databases }: UseDatabaseFiltersArgs) {
  const [search, setSearchRaw] = useState("")
  const [projectFilter, setProjectFilterRaw] = useState<ProjectFilter>("ALL")
  const [engineFilter, setEngineFilterRaw] = useState<EngineFilter>("ALL")
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>("ALL")
  const [page, setPage] = useState(1)

  // Reset halaman dilakukan di dalam setter, bukan `useEffect(() =>
  // setPage(1), [...])` — menghindari render berantai. Pola sama dengan
  // `use-user-filters` dan `use-project-filters`.
  const goToFirstPage = () => setPage(1)

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value)
    goToFirstPage()
  }, [])

  const setProjectFilter = useCallback((value: ProjectFilter) => {
    setProjectFilterRaw(value)
    goToFirstPage()
  }, [])

  const setEngineFilter = useCallback((value: EngineFilter) => {
    setEngineFilterRaw(value)
    goToFirstPage()
  }, [])

  const setStatusFilter = useCallback((value: StatusFilter) => {
    setStatusFilterRaw(value)
    goToFirstPage()
  }, [])

  const clearFilters = useCallback(() => {
    setSearchRaw("")
    setProjectFilterRaw("ALL")
    setEngineFilterRaw("ALL")
    setStatusFilterRaw("ALL")
    goToFirstPage()
  }, [])

  const filtered = useMemo(() => {
    let result = databases

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((d) => d.name.toLowerCase().includes(query))
    }

    if (projectFilter !== "ALL") {
      result = result.filter((d) => d.projectId === projectFilter)
    }

    if (engineFilter !== "ALL") {
      result = result.filter((d) => d.engine === engineFilter)
    }

    if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter)
    }

    return result
  }, [databases, search, projectFilter, engineFilter, statusFilter])

  /**
   * Ringkasan dihitung dari `filtered`, bukan dari seluruh daftar. Kalau
   * user memfilter status "Error", kartu "Butuh Perhatian" ikut jadi
   * jumlah hasil filter itu — bukan masih menampilkan total global.
   */
  const totalStorageGb = useMemo(
    () => filtered.reduce((sum, d) => sum + d.resources.storageUsedGb, 0),
    [filtered],
  )

  const needsAttention = useMemo(
    () => filtered.filter((d) => d.status !== "HEALTHY").length,
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // Filter bisa menyusut sampai `page` melebihi jangkauan — clamp saat
  // render, bukan lewat efek.
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE

  return {
    search,
    setSearch,
    projectFilter,
    setProjectFilter,
    engineFilter,
    setEngineFilter,
    statusFilter,
    setStatusFilter,
    page: currentPage,
    setPage,
    filtered,
    paged: filtered.slice(startIdx, startIdx + PAGE_SIZE),
    totalPages,
    rangeStart: filtered.length === 0 ? 0 : startIdx + 1,
    rangeEnd: Math.min(startIdx + PAGE_SIZE, filtered.length),
    totalStorageGb,
    needsAttention,
    hasFilters:
      search.trim() !== "" ||
      projectFilter !== "ALL" ||
      engineFilter !== "ALL" ||
      statusFilter !== "ALL",
    clearFilters,
  }
}
