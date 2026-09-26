import { Settings } from "lucide-react"

export function SettingsHeader() {
  return (
    <header className="space-y-1">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Settings className="size-7 text-primary" aria-hidden="true" />
        Settings
      </h1>
      <p className="text-sm text-muted-foreground">
        Kelola profil dan preferensi akun Anda.
      </p>
    </header>
  )
}
