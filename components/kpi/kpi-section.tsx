"use client"

import { cn } from "@/lib/utils"
import { KpiCard } from "@/components/kpi/kpi-card"
import { KpiCardSkeleton } from "@/components/kpi/kpi-card-skeleton"
import { KpiGrid } from "@/components/kpi/kpi-grid"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { KpiGridConfig, KpiItem } from "@/lib/kpi/types"
import type { Role } from "@/lib/mock-data"

interface KpiSectionProps<TData> {
  config: KpiGridConfig<TData>
  data?: TData
  role?: Role
  loading?: boolean
  className?: string
}

/**
 * Entry point tunggal untuk semua KPI. Halaman tidak boleh merakit card
 * sendiri — cukup kirim config + data, filtering per role terjadi di sini.
 */
export function KpiSection<TData>({
  config,
  data,
  role,
  loading,
  className,
}: KpiSectionProps<TData>) {
  const isRoleAllowed = !config.roles || !role || config.roles.includes(role)

  const items = isRoleAllowed
    ? config.items.filter((item) => {
        if (item.roles && role && !item.roles.includes(role)) return false
        if (item.visible && data !== undefined && !item.visible(data)) return false
        return true
      })
    : []

  if (config.hideWhenEmpty && items.length === 0) return null
  if (items.length === 0) return null

  const cols = config.cols ?? 4
  const hasTooltip = items.some((item) => Boolean(item.tooltip))
  const body = loading ? (
    <KpiGrid cols={cols}>
      {items.map((item) => (
        <KpiCardSkeleton key={`skeleton-${item.id}`} />
      ))}
    </KpiGrid>
  ) : (
    <KpiGrid cols={cols}>
      {items.map((item) => (
        <ResolvedKpi key={item.id} item={item} data={data} />
      ))}
    </KpiGrid>
  )

  const section = (
    <section className={cn("space-y-4", className)}>
      {(config.title || config.description) && (
        <header className="space-y-1">
          {config.title && (
            <h2 className="text-lg font-semibold tracking-tight">
              {config.title}
            </h2>
          )}
          {config.description && (
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          )}
        </header>
      )}
      {body}
    </section>
  )

  if (!hasTooltip) return section

  return <TooltipProvider delay={200}>{section}</TooltipProvider>
}

function ResolvedKpi<TData>({
  item,
  data,
}: {
  item: KpiItem<TData>
  data?: TData
}) {
  const resolve = <T,>(
    input: T | ((d: TData) => T) | undefined
  ): T | undefined => {
    if (typeof input === "function") {
      const fn = input as (d: TData) => T
      return data !== undefined ? fn(data) : undefined
    }
    return input
  }

  return (
    <KpiCard
      label={resolve(item.label) ?? item.id}
      value={resolve(item.value) ?? "—"}
      icon={item.icon}
      accent={item.accent}
      trend={resolve(item.trend) ?? "flat"}
      trendValue={resolve(item.trendValue)}
      trendLabel={item.trendLabel}
      tooltip={item.tooltip}
      progress={resolve(item.progress)}
      sparkline={resolve(item.sparkline)}
      href={item.href}
      disabled={resolve(item.disabled)}
    />
  )
}
