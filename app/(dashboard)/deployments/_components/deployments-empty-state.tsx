import { Rocket, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DeploymentsEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  onCreate: () => void
  canCreate: boolean
}

export function DeploymentsEmptyState({
  hasFilters,
  onClearFilters,
  onCreate,
  canCreate,
}: DeploymentsEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold">
          Tidak ada deployment yang cocok
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Rocket className="size-5 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">Belum ada deployment</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {canCreate
          ? "Deployment pertama akan muncul di sini setelah dijalankan."
          : "Belum ada deployment di proyek yang di-share ke akunmu."}
      </p>
      {canCreate && (
        <Button size="sm" onClick={onCreate} className="mt-4">
          Trigger Deployment
        </Button>
      )}
    </div>
  )
}
