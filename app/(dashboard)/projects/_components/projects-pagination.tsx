import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ProjectsPaginationProps {
  totalCount: number
  startIdx: number
  endIdx: number
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function ProjectsPagination({
  totalCount,
  startIdx,
  endIdx,
  page,
  totalPages,
  onPrev,
  onNext,
}: ProjectsPaginationProps) {
  if (totalCount === 0) return null

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        Menampilkan {startIdx + 1}–{endIdx} dari {totalCount} proyek
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrev}
          className="gap-1"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <span className="text-sm tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
          className="gap-1"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
