import { AlertTriangle, Circle, XCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { ErrorStats } from "../_hooks/use-errors"

interface ErrorStatsCardsProps {
  stats: ErrorStats
}

export function ErrorStatsCards({ stats }: ErrorStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kejadian</CardTitle>
          <XCircle className="size-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">
            {stats.totalOccurrences.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-muted-foreground">
            dari {stats.uniqueErrors} error unik
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengguna Terdampak</CardTitle>
          <AlertTriangle
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">
            {stats.totalAffected.toLocaleString("id-ID")}
          </p>
          {/*
            Angka ini dijumlahkan per-error, jadi user yang kena 3 error
            terhitung 3 kali. Label menyatakan itu supaya tidak dibaca
            sebagai "unique users".
          */}
          <p className="text-xs text-muted-foreground">
            akumulasi per-error, bisa overlap
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Terbuka</CardTitle>
          <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">{stats.open}</p>
          <p className="text-xs text-muted-foreground">belum terselesaikan</p>
        </CardContent>
      </Card>
    </div>
  )
}
