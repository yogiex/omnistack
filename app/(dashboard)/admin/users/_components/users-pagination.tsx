import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UsersPaginationProps {
  totalCount: number
  rangeStart: number
  rangeEnd: number
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function UsersPagination({
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPrev,
  onNext,
}: UsersPaginationProps) {
  if (totalCount === 0) return null

  return (
    <nav
      aria-label="Pagination user"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        Menampilkan {rangeStart}–{rangeEnd} dari {totalCount} user
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrev}
        >
          <ChevronLeft />
          Sebelumnya
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
          Berikutnya
          <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}
