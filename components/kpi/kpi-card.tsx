"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { KpiAccent, KpiTrend } from "@/lib/kpi/types"

/* -------------------------------------------------------------------------- */
/*  Accent map — warna ikon per accent, Tailwind palette, BUKAN hex.            */
/*  Dipusatkan di sini agar tidak ada duplikasi aksen di seluruh app.         */
/* -------------------------------------------------------------------------- */

/**
 * Warna foreground ikon (accent meresap ke warna ikon, bukan ke kotak
 * background). Ikon stat-card mengikuti pola `size-4`.
 */
const iconAccentMap: Record<KpiAccent, string> = {
  default: "text-muted-foreground",
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  violet: "text-violet-600 dark:text-violet-400",
}

export interface KpiCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  accent?: KpiAccent
  trend?: KpiTrend
  trendValue?: string
  trendLabel?: string
  tooltip?: string
  progress?: number
  sparkline?: number[]
  href?: string
  disabled?: { reason: string }
  className?: string
}

/**
 * KPI card presentasional.
 *
 * Catatan: komponen ini memakai `Tooltip` tanpa `TooltipProvider` —
 * provider dipasang satu kali di `KpiSection` (prinsip single source of truth).
 * Jika memakai `KpiCard` secara langsung, bungkus dengan `TooltipProvider`.
 */
export function KpiCard({
  label,
  value,
  icon,
  accent = "default",
  trend = "flat",
  trendValue,
  trendLabel,
  tooltip,
  progress,
  sparkline,
  href,
  disabled,
  className,
}: KpiCardProps) {
  const isDisabled = !!disabled
  const isInteractive = !!href && !isDisabled

  const card = (
    <Card
      className={cn(
        "group relative h-full overflow-hidden transition-all duration-200",
        isInteractive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
        isDisabled && "opacity-60",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <CardTitle className="truncate text-sm font-medium">{label}</CardTitle>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label={`Info tentang ${label}`}
                className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] leading-none text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ?
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {icon && (
          <span
            className={cn("shrink-0 [&_svg]:size-4", iconAccentMap[accent])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <TrendBadge trend={trend} value={trendValue} />
        </div>

        {(trendLabel || disabled) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {disabled ? disabled.reason : trendLabel}
          </p>
        )}

        {typeof progress === "number" && (
          <div
            role="progressbar"
            aria-valuenow={Math.round(Math.min(100, Math.max(0, progress)))}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {sparkline && sparkline.length > 1 && (
          <div className="mt-3 text-primary/70">
            <Sparkline data={sparkline} />
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Base UI tidak mendukung `asChild`, jadi `<Link>` membungkus `<Card>`
  // alih-alih Card yang merender Link di dalamnya.
  if (!isInteractive) return card

  return (
    <Link
      href={href as string}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${label}: buka detail`}
    >
      {card}
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function TrendBadge({
  trend = "flat",
  value,
}: {
  trend: KpiTrend
  value?: string
}) {
  if (!value) return null

  const config = {
    up: {
      icon: <ArrowUpRight className="size-3.5" />,
      className: "text-emerald-600 dark:text-emerald-400",
      label: "naik",
    },
    down: {
      icon: <ArrowDownRight className="size-3.5" />,
      className: "text-rose-600 dark:text-rose-400",
      label: "turun",
    },
    flat: {
      icon: <Minus className="size-3.5" />,
      className: "text-muted-foreground",
      label: "stabil",
    },
  }[trend]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        config.className
      )}
      aria-label={`Tren ${config.label}: ${value}`}
    >
      {config.icon}
      {value}
    </span>
  )
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((v - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
