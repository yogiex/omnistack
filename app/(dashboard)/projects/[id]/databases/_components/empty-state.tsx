"use client"

import { Database, Plus, RotateCcw, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DatabasesEmptyStateProps {
  hasFilters: boolean
  onCreate?: () => void
  onClearFilters?: () => void
}

export function DatabasesEmptyState({
  hasFilters,
  onCreate,
  onClearFilters,
}: DatabasesEmptyStateProps) {
  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-x-0 bottom-0 mx-auto flex size-14 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
            <Server className="size-6" />
          </div>
          <div className="absolute -top-1 -right-1 flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground shadow-sm">
            <Database className="size-5" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold">
            {hasFilters ? "Tidak ada hasil" : "Belum ada database"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "Tidak ada database yang cocok dengan filter yang dipilih. Coba ubah atau reset filter."
              : "Buat database pertama Anda untuk mulai menyimpan data aplikasi."}
          </p>
        </div>

        {!hasFilters && onCreate && (
          <Button onClick={onCreate}>
            <Plus className="size-4" />
            Buat Database Baru
          </Button>
        )}

        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <RotateCcw className="size-4" />
            Reset Filter
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
