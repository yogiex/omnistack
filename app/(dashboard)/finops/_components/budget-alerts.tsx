"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AlertSeverity, BudgetAlert } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface BudgetAlertsProps {
  alerts: BudgetAlert[]
  canDismiss: boolean
}

type FilterKey = "all" | "critical" | "warning" | "info"

const FILTERS: { key: FilterKey; label: string; severity?: AlertSeverity }[] = [
  { key: "all", label: "Semua" },
  { key: "critical", label: "Kritis", severity: "critical" },
  { key: "warning", label: "Peringatan", severity: "warning" },
  { key: "info", label: "Info", severity: "info" },
]

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { dot: string; border: string }
> = {
  critical: {
    dot: "bg-red-500",
    border: "border-l-red-500",
  },
  warning: {
    dot: "bg-amber-500",
    border: "border-l-amber-500",
  },
  info: {
    dot: "bg-blue-500",
    border: "border-l-blue-500",
  },
}

export function BudgetAlerts({ alerts, canDismiss }: BudgetAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterKey>("all")
  const [detailId, setDetailId] = useState<string | null>(null)

  const visible = useMemo(
    () => alerts.filter((a) => !dismissedIds.has(a.id)),
    [alerts, dismissedIds],
  )

  const filtered = useMemo(() => {
    if (filter === "all") return visible
    return visible.filter((a) => a.severity === filter)
  }, [visible, filter])

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  function markRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id))
  }

  function markAllRead() {
    setReadIds(new Set(visible.map((a) => a.id)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚠️ Peringatan &amp; Notifikasi Anggaran</CardTitle>
        <CardDescription>
          Pantau penggunaan anggaran proyek dan ambil tindakan sebelum melebihi
          batas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(({ key, label, severity }) => {
            const count =
              key === "all"
                ? visible.length
                : visible.filter((a) => a.severity === severity).length
            const activeFilter =
              key === "all" ? undefined : FILTERS.find((f) => f.key === key)?.severity
            return (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
              >
                {label}
                <Badge variant={filter === activeFilter ? "secondary" : "ghost"}>
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((alert) => {
            const style = SEVERITY_STYLES[alert.severity]
            const isRead = readIds.has(alert.id)
            return (
              <button
                type="button"
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={cn(
                  "w-full cursor-pointer rounded-lg border border-border border-l-4 p-3 text-left transition-opacity",
                  style.border,
                  isRead && "opacity-50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold">
                    <span
                      className={cn("size-2 shrink-0 rounded-full", style.dot)}
                    />
                    {alert.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {alert.timeLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alert.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetailId((prev) =>
                        prev === alert.id ? null : alert.id,
                      )
                    }}
                  >
                    Lihat Detail
                  </Button>
                  {canDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        dismiss(alert.id)
                      }}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
                {detailId === alert.id && (
                  <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Detail lengkap alert ini akan tersedia setelah integrasi
                    backend.
                  </p>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada alert untuk filter ini. 🎉
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" onClick={markAllRead}>
          Tandai Semua Dibaca
        </Button>
        <p className="text-sm text-muted-foreground">
          Menampilkan {filtered.length} dari {visible.length} alert
        </p>
      </CardFooter>
    </Card>
  )
}
