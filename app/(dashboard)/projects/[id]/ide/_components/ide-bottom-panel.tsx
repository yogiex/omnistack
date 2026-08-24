"use client"

import { CircleAlert, TriangleAlert, TerminalSquare } from "lucide-react"
import {
  IDE_PROBLEMS,
  IDE_TERMINAL_LINES,
} from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

type BottomTab = "terminal" | "problems" | "output"

interface IdeBottomPanelProps {
  tab: BottomTab
  onTabChange: (tab: BottomTab) => void
}

const TABS: { id: BottomTab; label: string }[] = [
  { id: "terminal", label: "TERMINAL" },
  { id: "problems", label: `PROBLEMS ${IDE_PROBLEMS.length}` },
  { id: "output", label: "OUTPUT" },
]

export function IdeBottomPanel({ tab, onTabChange }: IdeBottomPanelProps) {
  const errorCount = IDE_PROBLEMS.filter((p) => p.severity === "error").length
  const warningCount = IDE_PROBLEMS.filter((p) => p.severity === "warning").length

  return (
    <div className="flex h-44 shrink-0 flex-col border-t bg-muted/10">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            aria-pressed={tab === t.id}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
              tab === t.id && "bg-background text-foreground shadow-sm"
            )}
          >
            {t.id === "problems" && (
              <span className="flex items-center gap-0.5">
                <CircleAlert className="h-3 w-3 text-destructive" />
                {errorCount}
                <TriangleAlert className="h-3 w-3 text-amber-500" />
                {warningCount}
              </span>
            )}
            {t.label}
          </button>
        ))}
        <TerminalSquare className="ml-auto mr-2 h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-background/40 p-3 font-mono text-xs leading-relaxed">
        {tab === "terminal" &&
          IDE_TERMINAL_LINES.map((line, index) => (
            <div
              key={index}
              className={cn(
                "text-muted-foreground",
                line.includes("✓") && "text-emerald-600",
                line.includes("⚡") && "text-sky-500",
                line.startsWith("$") && "text-foreground"
              )}
            >
              {line}
            </div>
          ))}

        {tab === "problems" && (
          <div className="space-y-1">
            {IDE_PROBLEMS.map((p, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-muted-foreground"
              >
                {p.severity === "error" ? (
                  <CircleAlert className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span
                  className={cn(
                    p.severity === "error" && "text-destructive"
                  )}
                >
                  {p.message}
                </span>
                <span className="ml-auto text-muted-foreground/60">
                  {p.path.split("/").pop()}:{p.line}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "output" && (
          <div className="text-muted-foreground">
            Build log akan muncul di sini (Nixpacks/Buildpacks auto-detect) — mock.
          </div>
        )}
      </div>
    </div>
  )
}
