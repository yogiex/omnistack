"use client"

import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Info } from "lucide-react"

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
import type {
  OptimizationRecommendation,
  OptimizedProject,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface OptimizationRecommendationsProps {
  recommendations: OptimizationRecommendation[]
  optimized: OptimizedProject[]
  canApply: boolean
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-US")
}

export function OptimizationRecommendations({
  recommendations,
  optimized,
  canApply,
}: OptimizationRecommendationsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [learnMoreId, setLearnMoreId] = useState<string | null>(null)

  const activeRecs = useMemo(
    () =>
      recommendations.filter(
        (r) => !dismissedIds.has(r.id) && !appliedIds.has(r.id),
      ),
    [recommendations, dismissedIds, appliedIds],
  )

  const highImpact = activeRecs.filter((r) => r.impact === "high")
  const mediumImpact = activeRecs.filter((r) => r.impact === "medium")

  const totalMonthly = useMemo(
    () => activeRecs.reduce((sum, r) => sum + r.potentialSavings, 0),
    [activeRecs],
  )

  function applyRec(id: string) {
    setAppliedIds((prev) => new Set(prev).add(id))
  }

  function dismissRec(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  function renderRec(rec: OptimizationRecommendation) {
    return (
      <div key={rec.id} className="rounded-lg border p-4">
        <p className="font-semibold">
          {rec.projectName}: {rec.title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-muted-foreground">
          <span>{rec.currentDesc}</span>
          <ArrowRight className="size-3.5 shrink-0" />
          <span>{rec.recommendedDesc}</span>
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-mono text-sm tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
            Hemat potensial: ${formatMoney(rec.potentialSavings)}/bulan ($
            {formatMoney(rec.potentialSavings * 12)}/tahun)
          </p>
          <Badge variant="outline">Effort: {rec.effort}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canApply && (
            <Button size="sm" onClick={() => applyRec(rec.id)}>
              Apply
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dismissRec(rec.id)}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setLearnMoreId((prev) => (prev === rec.id ? null : rec.id))
            }
          >
            Learn More
          </Button>
        </div>
        {learnMoreId === rec.id && (
          <p className="mt-2 flex items-center gap-1.5 rounded-md bg-muted px-3 py-2 text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            Dokumentasi lengkap akan tersedia setelah integrasi backend.
          </p>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 Rekomendasi Optimasi Biaya</CardTitle>
        <CardDescription>
          Saran penghematan berdasarkan pola penggunaan resource proyek Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {highImpact.length > 0 && (
          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">🔴 High Impact</h4>
            {highImpact.map(renderRec)}
          </section>
        )}
        {mediumImpact.length > 0 && (
          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">🟡 Medium Impact</h4>
            {mediumImpact.map(renderRec)}
          </section>
        )}

        {appliedIds.size > 0 && (
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ✅ Diterapkan
            </h4>
            {recommendations
              .filter((r) => appliedIds.has(r.id))
              .map((rec) => (
                <div
                  key={rec.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2",
                    "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="text-sm">
                    {rec.projectName}: {rec.title}
                  </span>
                </div>
              ))}
          </section>
        )}

        {optimized.length > 0 && (
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">🟢 Sudah Optimal</h4>
            {optimized.map((opt) => (
              <div key={opt.projectId} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="text-sm font-medium">{opt.projectName}</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    — {opt.note}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeRecs.length === 0 &&
          highImpact.length === 0 &&
          mediumImpact.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Tidak ada rekomendasi aktif saat ini.
            </p>
          )}
      </CardContent>
      {activeRecs.length > 0 && (
        <CardFooter>
          <p className="font-mono text-sm tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            Total Potensi Penghematan: ${formatMoney(totalMonthly)}/bulan ($
            {formatMoney(totalMonthly * 12)}/tahun)
          </p>
        </CardFooter>
      )}
    </Card>
  )
}
