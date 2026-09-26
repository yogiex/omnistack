import type { BudgetAlert } from "@/lib/mock-finops"
import { cn } from "@/lib/utils"

interface CriticalAlertBannerProps {
  alerts: BudgetAlert[]
  className?: string
}

/**
 * Banner compact untuk alert budget kritis.
 *
 * Sengaja tanpa ikon, dismiss, atau expand: alert kritis memang harus
 * dibaca, dan detailnya sudah ada di section `#budget-alerts` di bawah.
 * Aksen lewat `border-l-2` + background tipis, bukan kartu full.
 */
export function CriticalAlertBanner({
  alerts,
  className,
}: CriticalAlertBannerProps) {
  const critical = alerts.filter((a) => a.severity === "critical")
  if (critical.length === 0) return null

  const first = critical[0]

  return (
    <section
      aria-label="Peringatan kritis anggaran"
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-l-red-500 bg-red-500/5 px-4 py-2.5",
        className
      )}
    >
      <p className="min-w-0 flex-1 text-sm text-red-700 dark:text-red-300">
        <span className="font-medium">{first.title}</span>
        {first.projectName ? (
          <span className="text-red-600/80 dark:text-red-400/80">
            {" "}
            · {first.projectName}
          </span>
        ) : null}
        <span className="text-red-600/80 dark:text-red-400/80">
          {" "}
          · {first.description}
        </span>
      </p>

      <a
        href="#budget-alerts"
        className="shrink-0 text-xs font-medium text-red-700 underline-offset-4 hover:underline dark:text-red-300"
      >
        {critical.length > 1
          ? `Lihat semua (${critical.length})`
          : "Lihat detail"}
      </a>
    </section>
  )
}
