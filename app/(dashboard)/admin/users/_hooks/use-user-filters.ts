"use client"

import { useCallback, useMemo, useState } from "react"

import {
  getUserStatus,
  type MockUser,
  type Role,
  type UserStatus,
} from "@/lib/mock-data"

export type SortField = "name" | "email" | "createdAt" | "role"
export type SortDir = "asc" | "desc"
export type StatusFilter = "all" | UserStatus
export type RoleFilter = "all" | Role

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Nama" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Tanggal Gabung" },
  { value: "role", label: "Role" },
]

export const ROLE_FILTERS: readonly RoleFilter[] = [
  "all",
  "ADMIN",
  "USER",
  "VIEWER",
]

export const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "active",
  "suspended",
  "invited",
]

export const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Semua",
  active: "Active",
  suspended: "Suspended",
  invited: "Invited",
}

const ROLE_SORT: Record<Role, number> = { ADMIN: 0, USER: 1, VIEWER: 2 }

const PAGE_SIZE = 10

interface UseUserFiltersArgs {
  users: MockUser[]
}

export function useUserFilters({ users }: UseUserFiltersArgs) {
  const [search, setSearchRaw] = useState("")
  const [roleFilter, setRoleFilterRaw] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  // Setiap perubahan filter memaksa balik ke halaman 1 — reset dilakukan
  // di dalam setter, bukan `useEffect(() => setPage(1), [...])`, supaya
  // tidak ada render berantai. Pola sama dengan `use-project-filters`.
  const goToFirstPage = () => setPage(1)

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value)
    goToFirstPage()
  }, [])

  const setRoleFilter = useCallback((value: RoleFilter) => {
    setRoleFilterRaw(value)
    goToFirstPage()
  }, [])

  const setStatusFilter = useCallback((value: StatusFilter) => {
    setStatusFilterRaw(value)
    goToFirstPage()
  }, [])

  const clearFilters = useCallback(() => {
    setSearchRaw("")
    setRoleFilterRaw("all")
    setStatusFilterRaw("all")
    goToFirstPage()
  }, [])

  const toggleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortDir("asc")
      }
      goToFirstPage()
    },
    [sortField],
  )

  const filtered = useMemo(() => {
    let result = [...users]

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((u) => getUserStatus(u) === statusFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "email") cmp = a.email.localeCompare(b.email)
      else if (sortField === "createdAt")
        cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortField === "role") cmp = ROLE_SORT[a.role] - ROLE_SORT[b.role]
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [users, search, roleFilter, statusFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // Filter bisa menyusut sehingga `page` sekarang melebihi jangkauan —
  // clamp saat render, bukan lewat efek.
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE

  return {
    search,
    roleFilter,
    statusFilter,
    sortField,
    sortDir,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    toggleSort,
    clearFilters,
    filtered,
    paged: filtered.slice(startIdx, startIdx + PAGE_SIZE),
    totalPages,
    currentPage,
    rangeStart: filtered.length === 0 ? 0 : startIdx + 1,
    rangeEnd: Math.min(startIdx + PAGE_SIZE, filtered.length),
    hasFilters:
      search.trim() !== "" || roleFilter !== "all" || statusFilter !== "all",
  }
}
