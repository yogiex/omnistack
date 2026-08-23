"use client"

import { LayoutGrid, List, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { MOCK_USERS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export type ProjectView = "grid" | "list"
export type SortKey = "updated" | "name" | "created"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Terakhir Diupdate" },
  { value: "name", label: "Nama A–Z" },
  { value: "created", label: "Tanggal Dibuat" },
]

interface FilterBarProps {
  searchRef: React.RefObject<HTMLInputElement | null>
  searchQuery: string
  onSearchChange: (value: string) => void
  sortValue: SortKey
  onSortChange: (value: SortKey) => void
  view: ProjectView
  onViewChange: (view: ProjectView) => void
  showOwnerFilter: boolean
  ownerFilter: string
  onOwnerFilterChange: (value: string) => void
}

export function FilterBar({
  searchRef,
  searchQuery,
  onSearchChange,
  sortValue,
  onSortChange,
  view,
  onViewChange,
  showOwnerFilter,
  ownerFilter,
  onOwnerFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] max-w-sm flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          placeholder="Cari proyek... ( / )"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {showOwnerFilter && (
        <select
          aria-label="Filter pemilik"
          value={ownerFilter}
          onChange={(e) => onOwnerFilterChange(e.target.value)}
          className="h-9 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
        >
          <option value="all">Semua Pemilik</option>
          {MOCK_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="Urutkan"
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        className="h-9 rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors focus:border-ring"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex overflow-hidden rounded-lg border" role="group">
        <button
          type="button"
          aria-label="Tampilan grid"
          onClick={() => onViewChange("grid")}
          className={cn(
            buttonVariants({ variant: view === "grid" ? "secondary" : "ghost", size: "sm" }),
            "rounded-none"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Tampilan list"
          onClick={() => onViewChange("list")}
          className={cn(
            buttonVariants({ variant: view === "list" ? "secondary" : "ghost", size: "sm" }),
            "rounded-none"
          )}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
