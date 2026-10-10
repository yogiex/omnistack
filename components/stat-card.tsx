import type { ReactNode } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  /** Label metrik, tampil kecil di kiri header. */
  title: ReactNode
  /** Angka/nilai utama. */
  value: ReactNode
  /** Keterangan tambahan di bawah nilai (opsional). */
  hint?: ReactNode
  /** Ikon kecil muted di kanan header (opsional). */
  icon?: ReactNode
  /** Jika diisi, seluruh kartu jadi tautan (opsional). */
  href?: string
  /** Kelas tambahan untuk nilai — mis. `text-destructive`. */
  valueClassName?: string
  /** Konten ekstra di bawah hint — mis. sparkline atau progress bar. */
  children?: ReactNode
  className?: string
}

/**
 * Kartu metrik tunggal (pola stat-card OmniStack).
 *
 * Layout: judul kecil di kiri, ikon muted di kanan, lalu nilai besar
 * `text-2xl font-bold` + hint `text-xs`. Dipakai seragam di seluruh
 * dashboard (monitoring, billing, infra, error-tracking, dll).
 */
export function StatCard({
  title,
  value,
  hint,
  icon,
  href,
  valueClassName,
  children,
  className,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        href &&
          "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <span
            className="shrink-0 text-muted-foreground [&_svg]:size-4"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold tabular-nums",
            valueClassName
          )}
        >
          {value}
        </div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        {children}
      </CardContent>
    </Card>
  )

  // Base UI tidak punya `asChild` — Link membungkus Card, bukan sebaliknya.
  if (!href) return card

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  )
}

interface StatGridProps {
  children: ReactNode
  /** Jumlah kolom pada breakpoint lg. Default 4. */
  cols?: 2 | 3 | 4
  className?: string
}

const gridCols = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const

/** Grid pembungkus StatCard dengan breakpoint konsisten. */
export function StatGrid({ children, cols = 4, className }: StatGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", gridCols[cols], className)}>
      {children}
    </div>
  )
}