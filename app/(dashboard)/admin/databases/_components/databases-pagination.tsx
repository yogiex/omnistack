import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DatabasesPaginationProps {
  totalCount: number
  rangeStart: number
  rangeEnd: number
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function DatabasesPagination({
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPrev,
  onNext,
}: DatabasesPaginationProps) {
  if (totalCount === 0) return null

  return (
    <nav
      aria-label="Pagination database"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-(--card-spacing) py-3"
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        Menampilkan {rangeStart}–{rangeEnd} dari {totalCount} database
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}
