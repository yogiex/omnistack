import { AlertTriangle, Circle, XCircle } from "lucide-react"

import { StatCard, StatGrid } from "@/components/stat-card"

import type { ErrorStats } from "../_hooks/use-errors"

interface ErrorStatsCardsProps {
  stats: ErrorStats
}

export function ErrorStatsCards({ stats }: ErrorStatsCardsProps) {
  return (
    <StatGrid cols={3}>
      <StatCard
        title="Total Kejadian"
        value={stats.totalOccurrences.toLocaleString("id-ID")}
        hint={`dari ${stats.uniqueErrors} error unik`}
        icon={<XCircle />}
      />
      <StatCard
        title="Pengguna Terdampak"
        value={stats.totalAffected.toLocaleString("id-ID")}
        // Angka dijumlahkan per-error, jadi user yang kena 3 error terhitung
        // 3 kali. Label menyatakan itu supaya tidak dibaca sebagai "unique users".
        hint="akumulasi per-error, bisa overlap"
        icon={<AlertTriangle />}
      />
      <StatCard
        title="Error Terbuka"
        value={stats.open}
        hint="belum terselesaikan"
        icon={<Circle />}
      />
    </StatGrid>
  )
}