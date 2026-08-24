"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MOCK_LOGS, type LogLevel, type LogCategory, type MockLogEntry } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const LIVE_MESSAGES: { level: LogLevel; source: string; message: string }[] = [
  { level: "INFO", source: "app-server", message: "GET /api/health 200 OK - 12ms" },
  { level: "INFO", source: "app-server", message: "GET /api/projects 200 OK - 38ms" },
  { level: "DEBUG", source: "auth", message: "Session refreshed for user dev@omnistack.dev" },
  { level: "WARN", source: "cache", message: "Cache miss ratio above threshold: 12%" },
  { level: "ERROR", source: "app-server", message: "POST /api/deploy 502 Bad Gateway - upstream timeout" },
  { level: "INFO", source: "database", message: "Connection pool: 7/20 active" },
  { level: "INFO", source: "scheduler", message: "Background job queue: 3 pending" },
]

const LEVEL_STYLES: Record<LogLevel, string> = {
  INFO: "bg-blue-500/10 text-blue-500",
  WARN: "bg-amber-500/10 text-amber-500",
  ERROR: "bg-red-500/10 text-red-500",
  DEBUG: "bg-muted text-muted-foreground",
}

interface LogStreamProps {
  projectId: string
  category: LogCategory
  searchQuery: string
  selectedLevels: string[]
  isPaused: boolean
}

export function LogStream({
  projectId,
  category,
  searchQuery,
  selectedLevels,
  isPaused,
}: LogStreamProps) {
  const [liveLogs, setLiveLogs] = useState<MockLogEntry[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const template = LIVE_MESSAGES[Math.floor(Math.random() * LIVE_MESSAGES.length)]
      const newLog: MockLogEntry = {
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "runtime",
        ...template,
      }
      setLiveLogs((prev) => [...prev.slice(-200), newLog])
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaused])

  const logs = useMemo(
    () => (category === "runtime" ? [...MOCK_LOGS.filter((l) => l.category === "runtime"), ...liveLogs] : MOCK_LOGS.filter((l) => l.category === category)),
    [category, liveLogs]
  )

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesLevel = selectedLevels.includes(log.level)
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          q === "" ||
          log.message.toLowerCase().includes(q) ||
          log.source.toLowerCase().includes(q)
        return matchesLevel && matchesSearch
      }),
    [logs, selectedLevels, searchQuery]
  )

  useEffect(() => {
    if (autoScroll && scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll, isPaused])

  const copyLog = (log: MockLogEntry) => {
    void navigator.clipboard.writeText(`${log.timestamp} [${log.level}] [${log.source}] ${log.message}`)
    setCopiedId(log.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isPaused ? "bg-muted-foreground" : "animate-pulse bg-emerald-500"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isPaused ? "Stream paused" : "Live stream"}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{filteredLogs.length} entries</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn("h-6 text-xs", autoScroll && "text-primary")}
        >
          Auto-scroll {autoScroll ? "ON" : "OFF"}
        </Button>
      </div>

      <div ref={scrollRef} className="h-[520px] overflow-y-auto font-mono text-xs">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="group flex items-start gap-3 border-b border-border/50 px-4 py-1.5 transition-colors hover:bg-accent/40"
          >
            <span className="w-[90px] shrink-0 tabular-nums text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString("en-GB")}
            </span>
            <span
              className={cn(
                "w-[64px] shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase",
                LEVEL_STYLES[log.level]
              )}
            >
              {log.level}
            </span>
            <span className="w-[100px] shrink-0 truncate text-purple-500">[{log.source}]</span>
            <span className="flex-1 break-all">{log.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyLog(log)}
              aria-label="Copy log line"
              className="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              {copiedId === log.id ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">No log entries match the filters.</p>
        )}
      </div>
    </div>
  )
}
