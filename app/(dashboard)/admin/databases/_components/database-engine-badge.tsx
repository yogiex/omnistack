import { cn } from "@/lib/utils"
import { ENGINE_META, type DatabaseEngine } from "@/lib/mock-data"

/**
 * Engine → Tailwind tone. Sebelumnya `ENGINE_META[engine].color` dipakai
 * sebagai hex di inline `style`, jadi warnanya tidak ikut berubah saat
 * palette diganti dan tidak punya varian dark. `color` di ENGINE_META
 * sekarang hanya dipakai di form pembuatan database.
 *
 * Key di-`Record<DatabaseEngine, …>` supaya menambah engine baru di
 * `lib/mock-data.ts` langsung jadi error TypeScript, bukan badgeAbu.
 */
type Tone = { bg: string; text: string; ring: string }

const ENGINE_TONE: Record<DatabaseEngine, Tone> = {
  POSTGRES: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/20",
  },
  MYSQL: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  MONGODB: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  REDIS: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/20",
  },
}

interface DatabaseEngineBadgeProps {
  engine: DatabaseEngine
  version?: string
}

export function DatabaseEngineBadge({
  engine,
  version,
}: DatabaseEngineBadgeProps) {
  const tone = ENGINE_TONE[engine]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        tone.bg,
        tone.text,
        tone.ring,
      )}
    >
      {ENGINE_META[engine].label}
      {version && (
        <span className="font-mono text-[10px] opacity-70">{version}</span>
      )}
    </span>
  )
}
