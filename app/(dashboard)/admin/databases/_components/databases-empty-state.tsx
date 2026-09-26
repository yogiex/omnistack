import Link from "next/link"
import { Database, Search } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatabasesEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function DatabasesEmptyState({
  hasFilters,
  onClearFilters,
}: DatabasesEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold">
          Tidak ada database yang cocok
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Coba ubah filter atau kata kunci pencarian.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4",
          )}
        >
          Reset Filter
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Database className="size-5 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">Belum ada database</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Database dibuat dari halaman detail proyek. Pilih proyek dulu untuk
        membuat database pertama.
      </p>
      <Link
        href="/projects"
        className={cn(buttonVariants({ size: "sm" }), "mt-4")}
      >
        Lihat Proyek
      </Link>
    </div>
  )
}
