"use client"

import { usePalette } from "@/lib/theme/palette-provider"
import { PALETTES } from "@/lib/theme/palettes"
import { cn } from "@/lib/utils"

/**
 * Row swatch bulat untuk preview & pemilihan color palette.
 * Dipakai di halaman marketing (landing) sebelum user login, di mana tidak ada
 * dropdown yang tersedia.
 *
 * Warna background memakai inline `style` karena nilainya benar-benar dinamis
 * (`p.swatch` berisi literal `oklch()` dari data palette, bukan token Tailwind).
 */
export function PalettePickerInline({ className }: { className?: string }) {
  const { palette, setPalette } = usePalette()

  return (
    <div
      role="group"
      aria-label="Color palette"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {PALETTES.map((p) => {
        const isActive = palette === p.id

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            aria-label={`Palette ${p.name}`}
            aria-pressed={isActive}
            title={`${p.name} — ${p.description}`}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full border-2 p-0.5",
              "transition-[transform,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "scale-110 border-primary ring-2 ring-primary/30 motion-reduce:scale-100"
                : "border-border hover:border-primary/50 hover:scale-105 motion-reduce:scale-100"
            )}
          >
            <span
              aria-hidden="true"
              className="size-full rounded-full ring-1 ring-black/10 dark:ring-white/15"
              style={{ backgroundColor: p.swatch }}
            />
          </button>
        )
      })}
    </div>
  )
}
