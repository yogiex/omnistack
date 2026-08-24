"use client"

import { useState } from "react"
import {
  Eye,
  Sparkles,
  Activity,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  SendHorizontal,
  CircleCheck,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  IDE_AI_HISTORY,
  IDE_AI_SUGGESTION,
  type IdeMetrics,
} from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

type RightMode = "preview" | "ai" | "metrics"

interface IdeRightPanelProps {
  mode: RightMode
  onModeChange: (mode: RightMode) => void
  metrics: IdeMetrics
  canWrite: boolean
}

const MODES: { id: RightMode; label: string; icon: typeof Eye }[] = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "ai", label: "AI Pilot", icon: Sparkles },
  { id: "metrics", label: "Metrics", icon: Activity },
]

export function IdeRightPanel({
  mode,
  onModeChange,
  metrics,
  canWrite,
}: IdeRightPanelProps) {
  const [aiInput, setAiInput] = useState("")

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l bg-muted/10">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b px-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            aria-pressed={mode === m.id}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
              mode === m.id && "bg-background text-foreground shadow-sm"
            )}
          >
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {mode === "preview" && (
          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span className="truncate font-mono">preview.acme.omni.dev</span>
              <ExternalLink className="ml-auto h-3 w-3" />
            </div>

            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-gradient-to-br from-muted via-background to-muted/40 p-4">
              <div className="w-full space-y-2 text-center">
                <Badge className="bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30">
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE · HMR
                </Badge>
                <p className="text-sm font-medium">Acme Store</p>
                <p className="text-xs text-muted-foreground">
                  Aplikasi rendered dalam iframe sandbox (mock)
                </p>
                <div className="mx-auto mt-2 flex w-40 flex-col gap-1 rounded border p-2 text-left text-[11px]">
                  <span className="rounded bg-muted px-1 py-0.5">Hero banner</span>
                  <span className="rounded bg-muted px-1 py-0.5">Product grid</span>
                  <span className="rounded bg-primary/20 px-1 py-0.5 text-primary">
                    🛒 Kart — updated via HMR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {[
                { label: "Mobile", icon: Smartphone },
                { label: "Tablet", icon: Smartphone },
                { label: "Desktop", icon: Monitor },
              ].map((d) => (
                <Button key={d.label} variant="outline" size="sm">
                  <d.icon className="mr-1 h-3.5 w-3.5" />
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {mode === "ai" && (
          <div className="flex h-full flex-col gap-3 p-3">
            {!canWrite && (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                VIEWER: AI Pilot disembunyikan.
              </p>
            )}
            <div className="flex flex-1 flex-col gap-3 overflow-auto">
              {IDE_AI_HISTORY.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                    message.role === "ai"
                      ? "mr-auto bg-muted"
                      : "ml-auto bg-primary/10 text-primary"
                  )}
                >
                  {message.text}
                </div>
              ))}
            </div>

            {canWrite && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium">Saya generate 3 file:</p>
                <ul className="space-y-1.5">
                  {IDE_AI_SUGGESTION.files.map((file) => (
                    <li key={file.path} className="flex items-center gap-2 text-xs">
                      <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="truncate font-mono">{file.path}</span>
                      <span className="ml-auto text-muted-foreground">
                        {file.status === "added" ? "+added" : "~modified"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1">
                    Apply Diff
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {canWrite && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  setAiInput("")
                }}
              >
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask anything…"
                  aria-label="AI Pilot prompt"
                  className="h-8 text-xs"
                />
                <Button type="submit" size="sm" className="h-8 w-8 p-0">
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        )}

        {mode === "metrics" && (
          <div className="space-y-3 p-3 text-xs">
            <div>
              <div className="mb-1 flex justify-between text-muted-foreground">
                <span>CPU</span>
                <span className="font-mono">{metrics.cpu}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${metrics.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-muted-foreground">
                <span>Memory</span>
                <span className="font-mono">{metrics.ram}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sky-500" style={{ width: "25%" }} />
              </div>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Response time (p95)</span>
              <span className="font-mono">{metrics.p95}ms</span>
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">
              Mini-APM mock — data nyata dari agent BYOC di fase implementasi.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
