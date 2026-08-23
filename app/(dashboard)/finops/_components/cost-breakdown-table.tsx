"use client"

import { Fragment, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  Search,
  Settings2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getBudgetStatus, type ProjectCostBreakdown } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type SortKey = "biaya" | "tren" | "nama"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "biaya", label: "Biaya" },
  { key: "tren", label: "Tren" },
  { key: "nama", label: "Nama" },
]

const BUDGET_BADGE: Record<
  NonNullable<ReturnType<typeof getBudgetStatus>>,
  { label: string; className: string }
> = {
  "on-track": {
    label: "On Track",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    label: "Warning (75%+)",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  over: {
    label: "Over",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
}

function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

export function CostBreakdownTable({
  items,
  canManageBudget,
}: {
  items: ProjectCostBreakdown[]
  canManageBudget: boolean
}) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("biaya")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [exportedId, setExportedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = q
      ? items.filter(
          (item) =>
            item.projectName.toLowerCase().includes(q) ||
            item.team.toLowerCase().includes(q)
        )
      : [...items]

    result.sort((a, b) => {
      if (sortKey === "nama")
        return a.projectName.localeCompare(b.projectName)
      if (sortKey === "tren") {
        const trendA =
          a.lastMonth === 0 ? Infinity : (a.thisMonth - a.lastMonth) / a.lastMonth
        const trendB =
          b.lastMonth === 0 ? Infinity : (b.thisMonth - b.lastMonth) / b.lastMonth
        return trendB - trendA
      }
      return b.thisMonth - a.thisMonth
    })

    return result
  }, [items, query, sortKey])

  const maxThisMonth = useMemo(
    () => Math.max(...items.map((item) => item.thisMonth), 1),
    [items]
  )
  const totalAll = useMemo(
    () => items.reduce((sum, item) => sum + item.thisMonth, 0),
    [items]
  )

  const handleExport = (item: ProjectCostBreakdown) => {
    setExportedId(item.projectId)
    window.setTimeout(() => setExportedId(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Rincian Biaya per Proyek</CardTitle>
        <CardDescription>
          Pantau distribusi biaya dan tren pengeluaran tiap proyek
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari proyek..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div
            role="group"
            aria-label="Urutkan berdasarkan"
            className="flex items-center gap-1 rounded-lg border border-border p-0.5"
          >
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={sortKey === option.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortKey(option.key)}
                aria-pressed={sortKey === option.key}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" aria-label="Expand" />
                <TableHead>Proyek</TableHead>
                <TableHead className="text-right">Bulan Ini</TableHead>
                <TableHead className="text-right">Bulan Lalu</TableHead>
                <TableHead>Tren</TableHead>
                <TableHead className="min-w-32">% dari Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Tidak ada proyek yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const isExpanded = expandedId === item.projectId
                  const delta = item.thisMonth - item.lastMonth
                  const deltaPct =
                    item.lastMonth === 0
                      ? null
                      : Math.round((delta / item.lastMonth) * 100)
                  const sharePct =
                    totalAll === 0
                      ? 0
                      : Math.round((item.thisMonth / totalAll) * 100)
                  const barPct = Math.max(
                    4,
                    Math.round((item.thisMonth / maxThisMonth) * 100)
                  )
                  const budgetStatus = getBudgetStatus(item)

                  return (
                    <Fragment key={item.projectId}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? `Tutup detail ${item.projectName}`
                                : `Buka detail ${item.projectName}`
                            }
                            onClick={() =>
                              setExpandedId(isExpanded ? null : item.projectId)
                            }
                          >
                            <ChevronDown
                              className={cn(
                                "transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.projectName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.team}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatUSD(item.thisMonth)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                          {formatUSD(item.lastMonth)}
                        </TableCell>
                        <TableCell>
                          {deltaPct === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
                                delta >= 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              {delta >= 0 ? (
                                <ArrowUpRight className="size-3.5" />
                              ) : (
                                <ArrowDownRight className="size-3.5" />
                              )}
                              {deltaPct > 0 ? "+" : ""}
                              {deltaPct}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">
                              {sharePct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/40">
                            <div className="flex flex-col gap-4 py-1 lg:flex-row lg:items-start lg:justify-between">
                              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                                {(
                                  [
                                    ["Compute", item.computeCost],
                                    ["Storage", item.storageCost],
                                    ["Network", item.networkCost],
                                    ["Database", item.databaseCost],
                                  ] as const
                                ).map(([label, value]) => (
                                  <div key={label}>
                                    <dt className="text-xs text-muted-foreground">
                                      {label}
                                    </dt>
                                    <dd className="font-mono text-sm tabular-nums font-medium">
                                      {formatUSD(value)}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                              <div className="flex flex-col gap-3 lg:items-end">
                                {budgetStatus && (
                                  <Badge
                                    variant="outline"
                                    className={BUDGET_BADGE[budgetStatus].className}
                                  >
                                    {budgetStatus === "over" && item.budget
                                      ? `Melebihi budget ${formatUSD(item.budget)}`
                                      : BUDGET_BADGE[budgetStatus].label}
                                  </Badge>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Link
                                    href={`/projects/${item.projectId}`}
                                    className={cn(
                                      buttonVariants({ variant: "ghost", size: "sm" })
                                    )}
                                  >
                                    Lihat Detail
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport(item)}
                                  >
                                    <Download />
                                    {exportedId === item.projectId
                                      ? "Terekspor!"
                                      : "Export"}
                                  </Button>
                                  {canManageBudget && item.budget !== undefined && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        console.log(`Mock: set budget ${item.projectName}`)
                                      }
                                    >
                                      <Settings2 />
                                      Set Budget
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-mono tabular-nums">{filtered.length}</span> dari{" "}
          <span className="font-mono tabular-nums">{items.length}</span> proyek ·
          Total:{" "}
          <span className="font-mono tabular-nums font-medium">
            {formatUSD(totalAll)}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
