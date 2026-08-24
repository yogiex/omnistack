"use client"

import { useState } from "react"
import { AlertCircle, Lightbulb, Loader2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AILogAnalyzerProps {
  projectId: string
}

interface AIInsight {
  id: string
  type: "error" | "warning" | "suggestion"
  title: string
  description: string
  recommendation: string
  severity: "high" | "medium" | "low"
}

const SEED_INSIGHTS: AIInsight[] = [
  {
    id: "1",
    type: "error",
    title: "Database Connection Pool Exhaustion",
    description:
      "Detected timeout errors against the connection pool (20/20 capacity) within the last hour.",
    recommendation:
      "Increase pool size to 50 or add PgBouncer-style pooling. Consider read replicas for hot paths.",
    severity: "high",
  },
  {
    id: "2",
    type: "warning",
    title: "High Memory Usage Pattern",
    description: "Memory trending upward over 6 hours. Current: 892MB / 1024MB (87%).",
    recommendation: "Investigate potential memory leak in workers. Alert at 80% threshold.",
    severity: "medium",
  },
  {
    id: "3",
    type: "suggestion",
    title: "Slow Query Detected",
    description: "Average query time increased from 45ms to 230ms in the last 24 hours.",
    recommendation: "Add index on users.email. Review the query plan for /api/users.",
    severity: "medium",
  },
]

const TYPE_ICONS = {
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
  suggestion: <Lightbulb className="h-4 w-4 text-blue-500" />,
} as const

const SEVERITY_COLORS = {
  high: "bg-red-500/10 text-red-500 border-red-500/50",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/50",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/50",
} as const

export function AILogAnalyzer({ projectId }: AILogAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])

  const analyzeLogs = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setInsights(SEED_INSIGHTS)
      setIsAnalyzing(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Log Analyzer
          </CardTitle>
          <Button size="sm" onClick={analyzeLogs} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Click &quot;Analyze&quot; to get AI-powered insights</p>
          </div>
        ) : (
          <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
            {insights.map((insight) => (
              <div key={insight.id} className="space-y-2 rounded-lg border bg-background p-3">
                <div className="flex items-start gap-2">
                  {TYPE_ICONS[insight.type]}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", SEVERITY_COLORS[insight.severity])}
                      >
                        {insight.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    <p className="rounded border-l-2 border-purple-500 bg-purple-500/5 py-1 pl-2 text-xs">
                      <span className="font-medium">Recommendation:</span> {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
