"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  getCategoryShares,
  getTrendStats,
  type CostCategory,
  type CostTrendPoint,
  type FinOpsOverview,
} from "@/lib/mock-finops"
import { formatUSD } from "@/lib/utils"

/** Slot token chart per kategori — dipakai chart DAN panel distribusi. */
const CHART_SLOT: Record<CostCategory, 1 | 2 | 3 | 4> = {
  compute: 1,
  storage: 2,
  network: 3,
  database: 4,
}

const SERIES = [
  { key: "compute", label: "Compute", slot: CHART_SLOT.compute },
  { key: "storage", label: "Storage", slot: CHART_SLOT.storage },
  { key: "network", label: "Network", slot: CHART_SLOT.network },
  { key: "database", label: "Database", slot: CHART_SLOT.database },
] as const

const chartConfig = {
  compute: { label: SERIES[0].label, color: "var(--color-chart-1)" },
  storage: { label: SERIES[1].label, color: "var(--color-chart-2)" },
  network: { label: SERIES[2].label, color: "var(--color-chart-3)" },
  database: { label: SERIES[3].label, color: "var(--color-chart-4)" },
} satisfies ChartConfig

interface CostTrendChartProps {
  data: CostTrendPoint[]
  overview: FinOpsOverview
}

export function CostTrendChart({ data, overview }: CostTrendChartProps) {
  const shares = useMemo(() => getCategoryShares(overview), [overview])

  const stats = useMemo(() => {
    const s = getTrendStats(data)
    const projection30d = s.avg * 30
    return {
      ...s,
      projection30d,
      budgetRemaining: overview.budget - projection30d,
    }
  }, [data, overview.budget])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Biaya 30 Hari</CardTitle>
        <CardDescription>
          Akumulasi harian per kategori infrastruktur, disusun bertumpuk.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart
              data={data}
              margin={{ left: 4, right: 8, top: 8 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v: number) => `$${v}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ??
                            name}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatUSD(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  dataKey={s.key}
                  name={s.key}
                  stackId="cost"
                  type="monotone"
                  fill={`var(--color-chart-${s.slot})`}
                  fillOpacity={0.35}
                  stroke={`var(--color-chart-${s.slot})`}
                  strokeWidth={1.5}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-xs md:grid-cols-4">
            <SummaryItem
              label="Rata-rata/hari"
              value={formatUSD(stats.avg)}
            />
            <SummaryItem
              label="Puncak"
              value={`${formatUSD(stats.peak)} (Hari ${stats.peakDay})`}
            />
            <SummaryItem
              label="Terendah"
              value={`${formatUSD(stats.low)} (Hari ${stats.lowDay})`}
            />
            <SummaryItem
              label="Proyeksi (30d)"
              value={`${formatUSD(stats.projection30d)} · Budget: ${formatUSD(overview.budget, 0)} · Sisa: ${formatUSD(stats.budgetRemaining)}`}
            />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <div>
            <p className="text-sm font-medium">Distribusi kategori</p>
            <p className="text-xs text-muted-foreground">
              Akumulasi biaya per kategori pada 30 hari terakhir.
            </p>
          </div>

          <div
            role="img"
            aria-label="Proporsi biaya per kategori infrastruktur"
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
          >
            {shares.map((c) => (
              <div
                key={c.category}
                className="h-full"
                style={{
                  width: `${c.pct}%`,
                  backgroundColor: `var(--color-chart-${CHART_SLOT[c.category]})`,
                }}
              />
            ))}
          </div>

          <ul className="space-y-2.5">
            {shares.map((c) => (
              <li
                key={c.category}
                className="flex items-center justify-between gap-3"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: `var(--color-chart-${CHART_SLOT[c.category]})`,
                    }}
                  />
                  {c.label}
                </span>
                <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {c.pct.toFixed(1)}%
                  </span>
                  <span className="font-medium">{formatUSD(c.value, 0)}</span>
                </span>
              </li>
            ))}
          </ul>

          <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-xs">
            <div>
              <dt className="text-muted-foreground">Total akumulasi</dt>
              <dd className="font-mono tabular-nums">
                {formatUSD(stats.total)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Budget bulanan</dt>
              <dd className="font-mono tabular-nums">
                {formatUSD(overview.budget, 0)}
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
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
