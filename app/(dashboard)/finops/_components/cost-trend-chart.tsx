"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import type { CostTrendPoint } from "@/lib/mock-data"

const W = 800
const H = 260
const Y_MAX = 60

interface SeriesDef {
  key: Exclude<keyof CostTrendPoint, "day">
  label: string
  className: string
}

const SERIES: SeriesDef[] = [
  { key: "compute", label: "Compute", className: "#10b981" },
  { key: "storage", label: "Storage", className: "#f59e0b" },
  { key: "network", label: "Network", className: "#ef4444" },
  { key: "database", label: "Database", className: "#3b82f6" },
]

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

export function CostTrendChart({ data }: { data: CostTrendPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const n = data.length

  const stacked = useMemo(() => {
    return data.map((point) => {
      let acc = 0
      return SERIES.map((s) => {
        const y0 = acc
        acc += point[s.key]
        return { ...s, y0, y1: Math.min(acc, Y_MAX) }
      })
    })
  }, [data])

  const x = (i: number): number =>
    n <= 1 ? W / 2 : (i / (n - 1)) * (W - 20) + 10
  const y = (v: number): number => H - (v / Y_MAX) * H

  const totals = data.map((p) => p.total)
  const totalSum = totals.reduce((a, b) => a + b, 0)
  const avgPerDay = n > 0 ? totalSum / n : 0
  let peakIdx = 0
  let lowIdx = 0
  totals.forEach((t, i) => {
    if (t > totals[peakIdx]) peakIdx = i
    if (t < totals[lowIdx]) lowIdx = i
  })
  const projection30d = n > 0 ? (totalSum / n) * 30 : 0
  const budgetRemaining = 1500 - projection30d

  const active = hoveredIndex !== null ? data[hoveredIndex] : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.className }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <div className="relative h-64 w-full">
        <div className="absolute inset-y-0 left-0 w-12">
          {[60, 45, 30, 15, 0].map((v) => (
            <div
              key={v}
              className="absolute right-1 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
              style={{ top: `${(v / Y_MAX) * 100}%` }}
            >
              ${v}
            </div>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="ml-14 h-full w-[calc(100%-3.5rem)] overflow-visible"
        >
          {[15, 30, 45].map((v) => (
            <line
              key={v}
              x1={0}
              x2={W}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              strokeWidth={1}
              className="text-border"
            />
          ))}

          {stacked.map((layers, i) =>
            layers.map((l, li) => {
              if (n <= 1) return null
              const prev = i === 0 ? null : stacked[i - 1][li]
              const x0 = x(i)
              const x1 = x(i + 1)
              const d =
                `M ${x0} ${y(l.y0)} ` +
                `L ${x0} ${y(l.y1)} ` +
                (prev
                  ? `L ${x1} ${y(prev.y1)} L ${x1} ${y(prev.y0)} `
                  : `L ${x1} ${y(0)} `) +
                "Z"
              return (
                <g key={`${l.key}-${i}`}>
                  <path d={d} fill={l.className} fillOpacity={0.55} />
                  {prev && (
                    <line
                      x1={x0}
                      x2={x1}
                      y1={y(l.y1)}
                      y2={y(prev.y1)}
                      stroke={l.className}
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              )
            })
          )}

          {data.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={n <= 1 ? 0 : x(i) - (W - 20) / (2 * (n - 1))}
              y={0}
              width={n <= 1 ? W : (W - 20) / (n - 1)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        <div className="ml-14 mt-1 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
          {[1, 5, 10, 15, 20, 25, 30]
            .filter((d) => n >= d)
            .map((d) => (
              <span key={d}>{d}</span>
            ))}
        </div>

        {active && hoveredIndex !== null && (
          <div
            className={cn(
              "pointer-events-none absolute top-2 z-10 w-48 rounded-lg border bg-popover p-3 text-xs shadow-md"
            )}
            style={{
              left: `${Math.min(Math.max((hoveredIndex / Math.max(1, n - 1)) * 100, 8), 92)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="mb-2 font-medium">Agu {active.day}</p>
            <div className="space-y-1">
              <Row color="#94a3b8" label="Total" value={formatUsd(active.total)} bold />
              {SERIES.map((s) => (
                <Row
                  key={s.key}
                  color={s.className}
                  label={s.label}
                  value={formatUsd(active[s.key])}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-xs md:grid-cols-4">
        <SummaryItem label="Rata-rata/hari" value={formatUsd(avgPerDay)} />
        <SummaryItem
          label="Puncak"
          value={`${formatUsd(totals[peakIdx] ?? 0)} (Hari ${data[peakIdx]?.day ?? "-"})`}
        />
        <SummaryItem
          label="Terendah"
          value={`${formatUsd(totals[lowIdx] ?? 0)} (Hari ${data[lowIdx]?.day ?? "-"})`}
        />
        <SummaryItem
          label="Proyeksi (30d)"
          value={`${formatUsd(projection30d)} · Budget: $1,500 · Sisa: ${formatUsd(budgetRemaining)}`}
        />
      </div>
    </div>
  )
}

function Row({
  color,
  label,
  value,
  bold,
}: {
  color: string
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className={cn("font-mono tabular-nums", bold && "font-semibold")}>{value}</span>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono tabular-nums">{value}</p>
    </div>
  )
}
