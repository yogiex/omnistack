"use client"

import { useCallback, useMemo, useState } from "react"

import type {
  ErrorSeverity,
  ErrorStatus,
  TrackedError,
} from "@/lib/mock-errors"

export type StatusFilter = "all" | ErrorStatus
export type SeverityFilter = "all" | ErrorSeverity
export type ProjectFilter = "all" | string

interface UseErrorFiltersArgs {
  errors: TrackedError[]
}

export function useErrorFilters({ errors }: UseErrorFiltersArgs) {
  const [search, setSearchRaw] = useState("")
  const [projectFilter, setProjectFilterRaw] = useState<ProjectFilter>("all")
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>("all")
  const [severityFilter, setSeverityFilterRaw] =
    useState<SeverityFilter>("all")

  const reset = useCallback(() => {
    setSearchRaw("")
    setProjectFilterRaw("all")
    setStatusFilterRaw("all")
    setSeverityFilterRaw("all")
  }, [])

  const filtered = useMemo(() => {
    let result = errors

    // `project` dan `stackSnippet` ikut dicari, bukan cuma `message` —
    // user sering ingat "error di project mana" atau nama file-nya, bukan
    // kalimat error-nya.
    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (e) =>
          e.message.toLowerCase().includes(query) ||
          e.project.toLowerCase().includes(query) ||
          e.stackSnippet.toLowerCase().includes(query),
      )
    }

    if (projectFilter !== "all") {
      result = result.filter((e) => e.project === projectFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter)
    }

    if (severityFilter !== "all") {
      result = result.filter((e) => e.severity === severityFilter)
    }

    return result
  }, [errors, search, projectFilter, statusFilter, severityFilter])

  return {
    search,
    setSearch: setSearchRaw,
    projectFilter,
    setProjectFilter: setProjectFilterRaw,
    statusFilter,
    setStatusFilter: setStatusFilterRaw,
    severityFilter,
    setSeverityFilter: setSeverityFilterRaw,
    filtered,
    hasFilters:
      search.trim() !== "" ||
      projectFilter !== "all" ||
      statusFilter !== "all" ||
      severityFilter !== "all",
    reset,
  }
}
