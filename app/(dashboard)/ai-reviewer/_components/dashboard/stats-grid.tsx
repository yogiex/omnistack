import { StatCard, StatGrid } from "@/components/stat-card"
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

function Stat({ title, value, trend, trendLabel }: StatCardProps) {
  const isPositive = trend > 0

  return (
    <StatCard
      title={title}
      value={value.toLocaleString()}
      icon={
        isPositive ? (
          <TrendingUp className="text-emerald-500" />
        ) : (
          <TrendingDown className="text-red-500" />
        )
      }
      hint={
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {isPositive ? "+" : ""}
          {trend}% {trendLabel}
        </span>
      }
    />
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <StatGrid cols={4}>
      <Stat
        title="Total Reviews"
        value={stats.totalReviews}
        trend={stats.trends.totalReviews}
        trendLabel="vs last month"
      />
      <Stat
        title="Open Findings"
        value={stats.openFindings}
        trend={stats.trends.openFindings}
        trendLabel="vs last month"
      />
      <Stat
        title="Critical & High"
        value={stats.criticalAndHigh}
        trend={stats.trends.criticalAndHigh}
        trendLabel="vs last month"
      />
      <Stat
        title="Fixed this Week"
        value={stats.fixedThisWeek}
        trend={stats.trends.fixedThisWeek}
        trendLabel="vs last week"
      />
    </StatGrid>
  )
}
