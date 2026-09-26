/** Identifier palette yang tersedia. Nilainya juga dipakai sebagai nilai atribut `data-palette` pada `<html>`. */
export type PaletteId =
  | "default"
  | "ocean"
  | "violet"
  | "emerald"
  | "sunset"
  | "rose"

/** Deskripsi satu palette: metadata + warna preview untuk picker. */
export interface Palette {
  id: PaletteId
  name: string
  description: string
  /** Warna preview dalam format `oklch()`. */
  swatch: string
}

/** Daftar palette yang bisa dipilih user, urut dari default. */
export const PALETTES: Palette[] = [
  {
    id: "default",
    name: "Default",
    description: "Neutral monokrom",
    swatch: "oklch(0.45 0 0)",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Biru tenang",
    swatch: "oklch(0.55 0.2 250)",
  },
  {
    id: "violet",
    name: "Violet",
    description: "Ungu kreatif",
    swatch: "oklch(0.55 0.22 290)",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Hijau segar",
    swatch: "oklch(0.55 0.15 160)",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Amber hangat",
    swatch: "oklch(0.65 0.17 55)",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Merah berani",
    swatch: "oklch(0.6 0.22 15)",
  },
]

/** Palette yang dipakai saat belum ada pilihan tersimpan. */
export const DEFAULT_PALETTE: PaletteId = "default"

/** Key localStorage tempat palette terpilih disimpan. */
export const PALETTE_STORAGE_KEY = "omnistack-palette"

/**
 * Resolve id menjadi objek Palette. Id yang tidak dikenal, `null`, atau
 * `undefined` (mis. isi localStorage rusak) jatuh ke palette default.
 */
export function getPalette(id: string | null | undefined): Palette {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0]
}
