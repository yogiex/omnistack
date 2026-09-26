import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Cermin urutan render `error-tracking-client.tsx`: header, 3 kartu stats,
 * filter bar, lalu 5 baris error. `useAuth` hydrate dari localStorage,
 * jadi tanpa skeleton ada render dengan `user === null`.
 */
export function ErrorTrackingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <div className="flex flex-col gap-2 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>

      <Skeleton className="h-8 w-full rounded-lg" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="size-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
