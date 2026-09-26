"use client"

import { LayoutGrid, List, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_USERS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export type ProjectView = "grid" | "list"
export type SortKey = "updated" | "name" | "created"

const ALL_OWNERS = "all"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Paling Banyak Deploy" },
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
        <Search
          className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={searchRef}
          placeholder="Cari proyek... ( / )"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {showOwnerFilter && (
        <Select
          value={ownerFilter}
          onValueChange={(v) => {
            if (v !== null) onOwnerFilterChange(v)
          }}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filter pemilik">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OWNERS}>Semua Pemilik</SelectItem>
            {MOCK_USERS.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={sortValue}
        onValueChange={(v) => onSortChange(v as SortKey)}
      >
        <SelectTrigger className="w-[200px]" aria-label="Urutkan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex overflow-hidden rounded-lg border" role="group">
        <button
          type="button"
          aria-label="Tampilan grid"
          aria-pressed={view === "grid"}
          onClick={() => onViewChange("grid")}
          className={cn(
            buttonVariants({
              variant: view === "grid" ? "secondary" : "ghost",
              size: "sm",
            }),
            "rounded-none"
          )}
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Tampilan list"
          aria-pressed={view === "list"}
          onClick={() => onViewChange("list")}
          className={cn(
            buttonVariants({
              variant: view === "list" ? "secondary" : "ghost",
              size: "sm",
            }),
            "rounded-none"
          )}
        >
          <List className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
