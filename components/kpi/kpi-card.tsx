"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { KpiAccent, KpiTrend } from "@/lib/kpi/types"

/* -------------------------------------------------------------------------- */
/*  Accent map — Tailwind palette pada opacity rendah, BUKAN hex.             */
/*  Dipusatkan di sini agar tidak ada duplikasiaksen di seluruh app.          */
/* -------------------------------------------------------------------------- */

const accentMap: Record<KpiAccent, string> = {
  default: "bg-muted text-foreground",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
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
 * Catatan: komponen inipzcial memakai `Tooltip` tanpa `TooltipProvider` —
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
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span className="truncate">{label}</span>
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
            </p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {value}
              </span>
              <TrendBadge trend={trend} value={trendValue} />
            </div>

            {(trendLabel || disabled) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {disabled ? disabled.reason : trendLabel}
              </p>
            )}
          </div>

          {icon && (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
                accentMap[accent]
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
        </div>

        {typeof progress === "number" && (
          <div
            role="progressbar"
            aria-valuenow={Math.round(Math.min(100, Math.max(0, progress)))}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {sparkline && sparkline.length > 1 && (
          <div className="mt-4 text-primary/70">
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
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      label: "naik",
    },
    down: {
      icon: <ArrowDownRight className="size-3.5" />,
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      label: "turun",
    },
    flat: {
      icon: <Minus className="size-3.5" />,
      className: "bg-muted text-muted-foreground",
      label: "stabil",
    },
  }[trend]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
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
