import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Struktur skeleton harus mirror `users-page-client.tsx`: header, stats,
 * toolbar + filter pills, lalu list. Kalau tidak, layar "lompat" begitu
 * data arrive karena tinggi tiap blok beda.
 */
export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stats — 4 kartu */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-xl p-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar + filter pills */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 min-w-[200px] flex-1 rounded-lg" />
              <Skeleton className="h-8 w-40 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-16" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List — 5 baris user */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
