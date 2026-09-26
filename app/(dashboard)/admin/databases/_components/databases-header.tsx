import Link from "next/link"
import { Database, Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DatabasesHeader() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Database className="size-7 text-primary" aria-hidden="true" />
          Semua Database
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola seluruh database lintas proyek di platform.
        </p>
      </div>
      {/*
       * `Link`, bukan `Button onClick={router.push}` — cmd/middle-click
       * tetap bisa membuka tab baru dan semantiknya masih link.
       * Database belum bisa dibuat dari halaman ini: engine dipilih di
       * level proyek, jadi ini hanya Pintasan ke daftar proyek.
       */}
      <Link
        href="/projects"
        className={cn(buttonVariants(), "gap-1.5")}
      >
        <Plus className="size-4" aria-hidden="true" />
        Buat Database
      </Link>
    </header>
  )
}
