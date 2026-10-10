"use client"

import { useState } from "react"
import { Activity, BarChart3, Gauge, Network, RefreshCw, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatCard, StatGrid } from "@/components/stat-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { MockDatabase } from "@/lib/mock-data"

const SERIES_A: number[] = [
  12, 14, 13, 16, 18, 17, 20, 22, 21, 24, 26, 25, 28, 27, 30, 32, 31, 29, 33,
  35, 34, 37, 36, 38,
]
const SERIES_B: number[] = [
  30, 28, 32, 29, 27, 31, 26, 28, 33, 30, 27, 29, 25, 28, 31, 27, 24, 26, 23,
  25, 22, 24, 21, 23,
]
const SERIES_C: number[] = [
  8, 10, 9, 11, 14, 13, 15, 18, 17, 20, 19, 22, 24, 23, 26, 25, 28, 30, 29, 32,
  31, 34, 33, 35,
]
const SERIES_D: number[] = [
  40, 42, 39, 44, 41, 45, 43, 47, 44, 48, 46, 50, 47, 51, 49, 52, 50, 54, 51,
  55, 53, 56, 54, 58,
]

const QPS_SERIES = [SERIES_A, SERIES_B, SERIES_C, SERIES_D]
const RESPONSE_SERIES = [SERIES_D, SERIES_C, SERIES_B, SERIES_A]

const TIME_RANGES = [
  { value: "1h", label: "1 Jam" },
  { value: "6h", label: "6 Jam" },
  { value: "24h", label: "24 Jam" },
  { value: "7d", label: "7 Hari" },
] as const

type TimeRange = (typeof TIME_RANGES)[number]["value"]

const SLOW_QUERIES = [
  {
    query: "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
    avgTimeMs: 420,
    count: 12,
  },
  {
    query:
      "SELECT COUNT(*) FROM analytics_events WHERE created_at > NOW() - INTERVAL '1 day'",
    avgTimeMs: 280,
    count: 8,
  },
  {
    query: "UPDATE sessions SET last_seen = NOW() WHERE token = $1",
    avgTimeMs: 150,
    count: 45,
  },
] as const

interface SparklineProps {
  series: number[]
}

function Sparkline({ series }: SparklineProps) {
  const max = Math.max(...series)
  return (
    <div className="flex h-28 items-end gap-1">
      {series.map((value, index) => (
        <div
          key={index}
          className={cn(
            "min-h-[4px] flex-1 rounded-sm",
            index === series.length - 1 ? "bg-primary" : "bg-primary/70"
          )}
          style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function DatabaseMetrics({ database }: { database: MockDatabase }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const [seedOffset, setSeedOffset] = useState(0)

  const rangeIndex = TIME_RANGES.findIndex((r) => r.value === timeRange)
  const qpsSeries = QPS_SERIES[(seedOffset + rangeIndex) % QPS_SERIES.length]
  const responseSeries =
    RESPONSE_SERIES[(seedOffset + rangeIndex) % RESPONSE_SERIES.length]

  const qpsAvg = Math.round(database.metrics.queriesPerSecond + seedOffset * 3)
  const connectionsPct = Math.round(
    (database.resources.connectionsCurrent /
      database.resources.connectionsMax) *
      100
  )
  const cacheHitRatio = database.metrics.cacheHitRatio ?? 0
  const isRedis = database.engine === "REDIS"

  const handleRefresh = () => setSeedOffset((prev) => prev + 1)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{database.name} / Metrik</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger size="sm" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-1 size-4" />
            Segarkan
          </Button>
        </div>
      </div>

      <StatGrid cols={4}>
        <StatCard
          title="Queries per Second (QPS)"
          value={qpsAvg}
          icon={<Activity />}
          hint="rata-rata qps"
        >
          <Sparkline series={qpsSeries} />
        </StatCard>

        <StatCard
          title="Koneksi Aktif"
          value={
            <>
              {database.resources.connectionsCurrent}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {database.resources.connectionsMax} koneksi
              </span>
            </>
          }
          icon={<Network />}
          hint="Koneksi aktif saat ini"
        >
          <div
            role="progressbar"
            aria-valuenow={connectionsPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Persentase koneksi terpakai"
            className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full",
                connectionsPct < 80
                  ? "bg-emerald-600 dark:bg-emerald-400"
                  : "bg-amber-600 dark:bg-amber-400"
              )}
              style={{ width: `${Math.min(100, connectionsPct)}%` }}
            />
          </div>
        </StatCard>

        <StatCard
          title="Response Time (p95)"
          value={
            <>
              {database.metrics.avgResponseTimeMs}
              <span className="text-sm font-normal text-muted-foreground"> ms</span>
            </>
          }
          icon={<Timer />}
          hint="rata-rata periode ini"
        >
          <Sparkline series={responseSeries} />
        </StatCard>

        <StatCard
          title={isRedis ? "Cache Hit Ratio" : "Uptime"}
          value={
            isRedis ? (
              <>
                {cacheHitRatio}
                <span className="text-sm font-normal text-muted-foreground">%</span>
              </>
            ) : (
              <>
                {database.metrics.uptime}
                <span className="text-sm font-normal text-muted-foreground">%</span>
              </>
            )
          }
          icon={<Gauge />}
          hint={isRedis ? "Efisiensi cache" : "30 hari terakhir"}
        >
          <div
            role="progressbar"
            aria-valuenow={isRedis ? cacheHitRatio : database.metrics.uptime}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={isRedis ? "Persentase cache hit" : "Persentase uptime"}
            className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
              style={{
                width: `${Math.min(
                  100,
                  isRedis ? cacheHitRatio : database.metrics.uptime,
                )}%`,
              }}
            />
          </div>
        </StatCard>
      </StatGrid>

      <div className="mt-6">
        <h3 className="mb-2 text-base font-semibold">
          Slow Queries (jam terakhir)
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Waktu Rata-rata</TableHead>
              <TableHead>Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SLOW_QUERIES.map((item) => (
              <TableRow key={item.query}>
                <TableCell className="max-w-[320px] truncate font-mono text-xs">
                  {item.query}
                </TableCell>
                <TableCell>{item.avgTimeMs} ms</TableCell>
                <TableCell>{item.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
