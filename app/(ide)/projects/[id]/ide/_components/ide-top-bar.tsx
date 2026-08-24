"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ChevronDown,
  CircleCheck,
  CloudUpload,
  Circle,
  Play,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IdeTopBarProps {
  projectName: string
  branch: string
  saveState: "saved" | "saving"
  canWrite: boolean
  onDeploy: () => void
}

export function IdeTopBar({
  projectName,
  branch,
  saveState,
  canWrite,
  onDeploy,
}: IdeTopBarProps) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-3 border-b bg-muted/30 px-3">
      <Link
        href="/projects"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1 px-2 text-muted-foreground"
        )}
        aria-label="Exit IDE"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="flex items-center gap-1.5 text-sm font-medium">
        <span className="text-muted-foreground">OmniStack</span>
        <span className="text-muted-foreground/60">›</span>
        <span className="text-foreground">{projectName}</span>
      </div>

      <button
        type="button"
        className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
      >
        <span className="font-mono">{branch}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {saveState === "saved" ? (
          <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Circle className="h-3.5 w-3.5 animate-pulse" />
        )}
        {saveState === "saved" ? "Saved · 12s ago" : "Saving…"}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!canWrite}>
          <Play className="mr-1.5 h-4 w-4" />
          Run
        </Button>
        <Button size="sm" onClick={onDeploy} disabled={!canWrite}>
          <CloudUpload className="mr-1.5 h-4 w-4" />
          Deploy
        </Button>
      </div>
    </header>
  )
}
