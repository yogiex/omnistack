"use client"

import { Plus, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UsersEmptyNoneProps {
  onInvite: () => void
}

export function UsersEmptyNone({ onInvite }: UsersEmptyNoneProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Belum ada user terdaftar</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Invite anggota tim untuk mulai berkolaborasi.
      </p>
      <Button onClick={onInvite} size="sm" className="mt-4 gap-1.5">
        <Plus className="size-4" aria-hidden="true" />
        Invite User
      </Button>
    </div>
  )
}

interface UsersEmptyFilteredProps {
  searchQuery?: string
  onClearFilters: () => void
}

export function UsersEmptyFiltered({
  searchQuery,
  onClearFilters,
}: UsersEmptyFilteredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {searchQuery
          ? `Tidak ada user cocok dengan "${searchQuery}"`
          : "Tidak ada user sesuai filter"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Coba ubah kata kunci pencarian atau filter kamu.
      </p>
      <Button
        onClick={onClearFilters}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        Reset Filter
      </Button>
    </div>
  )
}
