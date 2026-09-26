"use client"

import { Search, SlidersHorizontal } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import {
  SORT_OPTIONS,
  type SortDir,
  type SortField,
} from "../_hooks/use-user-filters"

interface UsersToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sortField: SortField
  sortDir: SortDir
  onToggleSort: (field: SortField) => void
}

export function UsersToolbar({
  search,
  onSearchChange,
  sortField,
  sortDir,
  onToggleSort,
}: UsersToolbarProps) {
  const activeLabel =
    SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Urutkan"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau email..."
          aria-label="Cari user"
          className="pl-8"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>
            {activeLabel} ({sortDir === "asc" ? "A-Z" : "Z-A"})
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
          </DropdownMenuGroup>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onToggleSort(opt.value)}
              className="justify-between"
            >
              {opt.label}
              {sortField === opt.value && (
                <span className="text-xs text-muted-foreground">
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
