import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { ReviewStats } from "../types"

interface StatsGridProps {
  stats: ReviewStats
}

interface StatCardProps {
  title: string
  value: number
  trend: number
  trendLabel: string
}

function StatCard({ title, value, trend, trendLabel }: StatCardProps) {
  const isPositive = trend > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className={cn("mt-1 flex items-center gap-1 text-xs", isPositive ? "text-green-500" : "text-red-500")}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? "+" : ""}{trend}% {trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Total Reviews"
        value={stats.totalReviews}
        trend={stats.trends.totalReviews}
        trendLabel="vs last month"
      />
      <StatCard
        title="Open Findings"
        value={stats.openFindings}
        trend={stats.trends.openFindings}
        trendLabel="vs last month"
      />
      <StatCard
        title="Critical & High"
        value={stats.criticalAndHigh}
        trend={stats.trends.criticalAndHigh}
        trendLabel="vs last month"
      />
      <StatCard
        title="Fixed this Week"
        value={stats.fixedThisWeek}
        trend={stats.trends.fixedThisWeek}
        trendLabel="vs last week"
      />
    </div>
  )
}
