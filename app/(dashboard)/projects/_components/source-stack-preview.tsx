import { CheckCircle2, Layers } from "lucide-react"

import type { MockProjectStack } from "@/lib/mock-data"

interface SourceStackPreviewProps {
  detectedStack?: MockProjectStack
}

/**
 * Baris konfirmasi read-only hasil deteksi stack.
 *
 * Sengaja bukan input: user bisa keliru menyalakan framework yang tidak ada
 * di repo. Nilai berasal dari `analyzeSource()` (mock) — lihat
 * `next-update-fitur-git-integration.md` §6.
 */
export function SourceStackPreview({ detectedStack }: SourceStackPreviewProps) {
  const { frontend = [], backend = [], database = [] } = detectedStack ?? {}
  const stack = [...frontend, ...backend, ...database]

  if (stack.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        <Layers className="size-4 shrink-0" aria-hidden="true" />
        Stack belum terdeteksi. Anda tetap bisa membuat proyek dan mengubah
        konfigurasi nanti.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
      <p className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        Terdeteksi otomatis (read-only)
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {stack.map((tech) => (
          <span
            key={tech}
            className="rounded border bg-background px-1.5 py-0.5 text-xs font-medium"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}