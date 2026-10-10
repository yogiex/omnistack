import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Struktur skeleton harus mirror `users-page-client.tsx`: header, stats,
 * toolbar, lalu grouped list. Kalau tidak, layar "lompat" begitu data
 * arrive karena tinggi tiap blok beda.
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
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 min-w-[200px] flex-1 rounded-lg" />
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* List — 2 grup, masing-masing 3 baris user */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            {["User Aktif", "Undangan Pending"].map((group) => (
              <div key={group} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Skeleton className="size-4 shrink-0" />
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-56" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
