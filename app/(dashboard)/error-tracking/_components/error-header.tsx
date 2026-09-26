import { Bug } from "lucide-react"

export function ErrorHeader() {
  return (
    <header className="space-y-1">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Bug className="size-7 text-primary" aria-hidden="true" />
        Error Tracking
      </h1>
      <p className="text-sm text-muted-foreground">
        Pantau dan tangani error dari semua proyek Anda dalam satu tempat.
      </p>
    </header>
  )
}
