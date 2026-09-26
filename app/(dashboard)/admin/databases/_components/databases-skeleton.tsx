import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Cermin struktur `admin-databases-client.tsx`: header, 3 kartu ringkasan,
 * toolbar (search + 3 select), lalu tabel. Tanpa ini layar kosong selama
 * `useAuth` hydrate dari localStorage.
 */
export function DatabasesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 py-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-8 lg:max-w-xs lg:flex-1" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full sm:w-40" />
          ))}
        </div>
      </div>

      <Card className="py-0">
        <div className="space-y-3 px-(--card-spacing) py-4">
          <Skeleton className="h-4 w-full max-w-md" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
