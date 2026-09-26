import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ProjectsEmptyFiltered({
  onReset,
}: {
  onReset: () => void
}) {
  return (
    <Card>
      <CardContent className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold">
          Tidak ada proyek yang cocok
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Coba ubah filter atau kata kunci pencarian Anda.
        </p>
        <Button variant="outline" size="sm" onClick={onReset} className="mt-5">
          Reset Filter
        </Button>
      </CardContent>
    </Card>
  )
}
