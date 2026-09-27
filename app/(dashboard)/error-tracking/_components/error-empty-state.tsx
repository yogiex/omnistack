import { Bug, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ErrorEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function ErrorEmptyState({
  hasFilters,
  onClearFilters,
}: ErrorEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold">
          Tidak ada error yang cocok
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Coba ubah filter atau kata kunci pencarian.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4"
        >
          Reset Filter
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
        <Bug
          className="size-5 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold">Tidak ada error</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Semua proyek berjalan lancar. Error baru akan muncul di sini begitu
        terdeteksi.
      </p>
    </div>
  )
}
