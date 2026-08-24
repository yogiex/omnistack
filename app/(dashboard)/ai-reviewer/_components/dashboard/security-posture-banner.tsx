import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { getScoreColor } from "../mock-data-reviewer"
import type { SecurityPosture } from "../types"

interface SecurityPostureBannerProps {
  posture: SecurityPosture
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SecurityPostureBanner({ posture }: SecurityPostureBannerProps) {
  const circumference = 2 * Math.PI * 28
  const dashOffset = (posture.score / 100) * circumference

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center gap-6 p-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-muted"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className={cn("stroke-current", getScoreColor(posture.score))}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${dashOffset} ${circumference}`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {posture.score}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Security Posture</h3>
            <Badge variant="outline" className="text-xs">NIST SSDF</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {posture.openCriticals} open criticals · Last scan: {formatTimeAgo(posture.lastScan)}
          </p>
        </div>

        <div className="hidden w-48 shrink-0 md:block">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", getScoreColor(posture.score))}
              style={{ width: `${posture.score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
