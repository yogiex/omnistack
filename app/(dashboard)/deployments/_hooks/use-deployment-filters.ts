"use client"

import { useCallback, useMemo, useState } from "react"

import type { MockDeployment } from "@/lib/mock-data"
import {
  getEffectiveStatus,
  getProjectName,
  timeLabelToSecondsAgo,
  type DeployView,
  type DeploymentEnvironment,
  type EffectiveDeploymentStatus,
} from "@/lib/deployment-utils"

export type { DeployView }

export type DateSort = "newest" | "oldest"
export type StatusFilter = "all" | EffectiveDeploymentStatus
export type EnvironmentFilter = "all" | DeploymentEnvironment
export type ProjectFilter = string | "all"

const PAGE_SIZE = 10

interface UseDeploymentFiltersArgs {
  deployments: MockDeployment[]
  projects: { id: string; name: string }[]
}

export function useDeploymentFilters({
  deployments,
  projects,
}: UseDeploymentFiltersArgs) {
  const [search, setSearchRaw] = useState("")
  const [projectFilter, setProjectFilterRaw] = useState<ProjectFilter>("all")
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>("all")
  const [environmentFilter, setEnvironmentFilterRaw] =
    useState<EnvironmentFilter>("all")
  const [dateSort, setDateSort] = useState<DateSort>("newest")
  const [view, setView] = useState<DeployView>("list")
  const [page, setPage] = useState(1)

  // Reset halaman di dalam setter, bukan `useEffect(() => setPage(1), [deps])`
  // — menghindari render berantai. Pola sama dengan `use-user-filters`.
  const goToFirstPage = () => setPage(1)

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value)
    goToFirstPage()
  }, [])

  const setProjectFilter = useCallback((value: ProjectFilter) => {
    setProjectFilterRaw(value)
    goToFirstPage()
  }, [])

  const setStatusFilter = useCallback((value: StatusFilter) => {
    setStatusFilterRaw(value)
    goToFirstPage()
  }, [])

  const setEnvironmentFilter = useCallback((value: EnvironmentFilter) => {
    setEnvironmentFilterRaw(value)
    goToFirstPage()
  }, [])

  const reset = useCallback(() => {
    setSearchRaw("")
    setProjectFilterRaw("all")
    setStatusFilterRaw("all")
    setEnvironmentFilterRaw("all")
    setDateSort("newest")
    goToFirstPage()
  }, [])

  const filtered = useMemo(() => {
    let result = deployments

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((d) => {
        const pname = getProjectName(d.projectId, projects).toLowerCase()
        return (
          pname.includes(query) ||
          d.branch.toLowerCase().includes(query) ||
          d.commitMessage.toLowerCase().includes(query) ||
          d.triggeredBy.toLowerCase().includes(query)
        )
      })
    }

    if (projectFilter !== "all") {
      result = result.filter((d) => d.projectId === projectFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => getEffectiveStatus(d) === statusFilter)
    }

    if (environmentFilter !== "all") {
      result = result.filter((d) => d.environment === environmentFilter)
    }

    /**
     * Kunci sort dihitung sekali per deployment, bukan di dalam comparator.
     * Sebelumnya `timeLabelToSecondsAgo` dipanggil O(n log n) kali — tiap
     * perbandingan mengulang regex yang sama untuk dua objek yang sama.
     * `UNKNOWN_AGE_SECONDS` membuat label tak terbaca urut paling akhir
     * di kedua arah.
     */
    return result
      .map((d) => ({ d, age: timeLabelToSecondsAgo(d.timeLabel) }))
      .sort((a, b) =>
        dateSort === "newest" ? a.age - b.age : b.age - a.age,
      )
      .map((entry) => entry.d)
  }, [
    deployments,
    projects,
    search,
    projectFilter,
    statusFilter,
    environmentFilter,
    dateSort,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // Filter bisa menyusut sampai `page` melebihi jangkauan — clamp saat render.
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE

  return {
    search,
    setSearch,
    projectFilter,
    setProjectFilter,
    statusFilter,
    setStatusFilter,
    environmentFilter,
    setEnvironmentFilter,
    dateSort,
    setDateSort,
    view,
    setView,
    page: currentPage,
    setPage,
    filtered,
    paged: filtered.slice(startIdx, startIdx + PAGE_SIZE),
    totalPages,
    rangeStart: filtered.length === 0 ? 0 : startIdx + 1,
    rangeEnd: Math.min(startIdx + PAGE_SIZE, filtered.length),
    hasFilters:
      search.trim() !== "" ||
      projectFilter !== "all" ||
      statusFilter !== "all" ||
      environmentFilter !== "all",
    reset,
  }
}
