"use client"

import { Search, SlidersHorizontal, Trash2, UserCog, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Role } from "@/lib/mock-data"

import { SORT_OPTIONS, type SortDir, type SortField } from "../_hooks/use-user-filters"

export type StatusFilterValue = "all" | "active" | "invited" | "suspended"

interface UsersToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: Role | "all"
  onRoleFilterChange: (value: Role | "all") => void
  statusFilter: StatusFilterValue
  onStatusFilterChange: (value: StatusFilterValue) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  sortField: SortField
  sortDir: SortDir
  onToggleSort: (field: SortField) => void
  selectedCount: number
  onBulkChangeRole: () => void
  onBulkDelete: () => void
  onClearSelection: () => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export function UsersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  hasActiveFilters,
  sortField,
  sortDir,
  onToggleSort,
  selectedCount,
  onBulkChangeRole,
  onBulkDelete,
  onClearSelection,
  searchInputRef,
}: UsersToolbarProps) {
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Urutkan"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama atau email..."
            aria-label="Cari user"
            className="pl-8"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v) => onRoleFilterChange(v as Role | "all")}
        >
          <SelectTrigger aria-label="Filter role" className="w-36">
            <SelectValue placeholder="Semua role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua role</SelectItem>
            <SelectItem value="ADMIN">Administrator</SelectItem>
            <SelectItem value="USER">Developer</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as StatusFilterValue)}
        >
          <SelectTrigger aria-label="Filter status" className="w-40">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="invited">Undangan pending</SelectItem>
            <SelectItem value="suspended">Ditangguhkan</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => onToggleSort(sortField)}
          aria-label={`Urutkan: ${activeSortLabel}`}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>
            {activeSortLabel} ({sortDir === "asc" ? "A-Z" : "Z-A"})
          </span>
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            Reset filter
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-2"
          aria-live="polite"
        >
          <span className="text-sm text-muted-foreground">
            {selectedCount} user dipilih
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBulkChangeRole}>
              <UserCog className="size-4" aria-hidden="true" />
              Ubah Role
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Hapus
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              aria-label="Batalkan pilihan"
              className="size-8"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
