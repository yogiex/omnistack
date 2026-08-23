"use client"

import { useState } from "react"
import {
  DollarSign,
  Download,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  getMockProjectsByUser,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "FinOps Seluruh Sistem",
  USER: "FinOps Proyek Anda",
  VIEWER: "FinOps (Read-Only)",
}

const FINOPS_STATS = [
  {
    title: "Total Biaya Bulan Ini",
    value: "$247.80",
    note: "Agustus 2026",
    icon: DollarSign,
  },
  {
    title: "Estimasi Bulan Depan",
    value: "$262.40",
    note: "+5.9% vs bulan ini",
    icon: TrendingUp,
  },
  {
    title: "Hemat vs Vercel",
    value: "$1,890",
    note: "Perbandingan biaya setara",
    icon: PiggyBank,
  },
  {
    title: "Resource Aktif",
    value: "12 vCPU / 24 GB",
    note: "Di seluruh node cluster",
    icon: Wallet,
  },
]

const TREND_MONTHS = [
  { label: "Mar", cost: 148 },
  { label: "Apr", cost: 172 },
  { label: "Mei", cost: 165 },
  { label: "Jun", cost: 201 },
  { label: "Jul", cost: 224 },
  { label: "Agu", cost: 248 },
]

function estimateCost(deployments: number): number {
  return 12 + deployments * 2.5
}

export function FinOpsClient() {
  const { user } = useAuth()
  const [notice, setNotice] = useState("")

  if (!user) return null

  const projects = getMockProjectsByUser(user.id, user.role)
  const costs = projects.map((project) => ({
    ...project,
    cost: estimateCost(project.deployments),
  }))
  const maxCost = Math.max(...costs.map((c) => c.cost), 1)
  const maxTrend = Math.max(...TREND_MONTHS.map((m) => m.cost))

  const handleExport = () => {
    setNotice("Export disiapkan (mock)")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {TITLE_BY_ROLE[user.role]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pantau biaya infrastruktur per proyek dan bandingkan dengan provider
          lain.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FINOPS_STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Biaya per proyek */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Biaya per Proyek</CardTitle>
            <CardDescription>
              Estimasi biaya bulan ini berdasarkan jumlah deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada proyek yang dapat dipantau.
              </p>
            ) : (
              costs.map((project) => (
                <div key={project.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.deployments} deployment · $
                      {project.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(project.cost / maxCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tren biaya */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tren Biaya 6 Bulan</CardTitle>
              <CardDescription>Total biaya Mar hingga Agu 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end gap-3">
                {TREND_MONTHS.map((month) => {
                  const isHighest = month.cost === maxTrend
                  return (
                    <div
                      key={month.label}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={cn(
                            "w-full rounded-t-md",
                            isHighest ? "bg-primary" : "bg-primary/40"
                          )}
                          style={{
                            height: `${(month.cost / maxTrend) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {month.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Laporan</CardTitle>
              <CardDescription>Unduh rincian biaya sebagai CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleExport} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              {notice && (
                <p className="text-sm text-muted-foreground" role="status">
                  {notice}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
