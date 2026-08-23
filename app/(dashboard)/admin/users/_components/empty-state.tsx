"use client"

import { Search, Users } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UsersEmptyStateProps {
  hasFilters: boolean
  searchQuery?: string
  onClearFilters: () => void
}

export function UsersEmptyState({
  hasFilters,
  searchQuery,
  onClearFilters,
}: UsersEmptyStateProps) {
  const heading = hasFilters
    ? searchQuery
      ? `Tidak ada user cocok dengan "${searchQuery}"`
      : "Tidak ada user sesuai filter"
    : "Belum ada user terdaftar"

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users className="h-10 w-10 text-muted-foreground" />
        <Search className="absolute bottom-3 right-3 h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{heading}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Coba ubah kata kunci pencarian atau filter kamu.
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
        >
          Reset Filter
        </button>
      )}
    </div>
  )
}
