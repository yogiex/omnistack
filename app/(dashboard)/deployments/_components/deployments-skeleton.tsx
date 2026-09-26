import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Cermin urutan render `deployments-list.tsx`: header, KPI, stats, filter
 * bar, active deployments, lalu tabel. `useAuth` hydrate dari
 * localStorage, jadi tanpa skeleton ada render dengan `user === null`.
 */
export function DeploymentsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-8 w-12" />
            </div>
          </Card>
        ))}
      </div>

      <Skeleton className="h-8 w-full rounded-lg" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Card>
          <CardContent className="space-y-3 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
