"use client"

import { ChevronDown, CircleAlert, TriangleAlert, Keyboard } from "lucide-react"

interface IdeStatusBarProps {
  branch: string
  node: {
    id: string
    cpuPercent: number
    ramUsed: string
    region: string
  }
  onToggleBottom: () => void
  onOpenCommand: () => void
}

export function IdeStatusBar({
  branch,
  node,
  onToggleBottom,
  onOpenCommand,
}: IdeStatusBarProps) {
  const problems = {
    errors: 1,
    warnings: 2,
  }

  return (
    <footer className="flex h-6 shrink-0 items-center gap-3 bg-foreground px-3 text-[11px] text-background/80">
      <button
        type="button"
        className="flex items-center gap-1 rounded-sm px-1 hover:bg-background/10"
      >
        <span className="font-mono">{branch}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <button
        type="button"
        onClick={onToggleBottom}
        className="flex items-center gap-1 rounded-sm px-1 hover:bg-background/10"
      >
        <CircleAlert className="h-3 w-3 text-red-400" />
        {problems.errors}
        <TriangleAlert className="ml-1 h-3 w-3 text-amber-400" />
        {problems.warnings}
      </button>

      <span className="hidden px-1 sm:inline">
        <span className="text-background/50">env: </span>development
        <ChevronDown className="ml-0.5 inline h-3 w-3" />
      </span>

      <span className="hidden md:inline px-1">UTF-8</span>
      <span className="hidden md:inline px-1">TypeScript 5.0</span>

      <button
        type="button"
        className="ml-auto flex items-center gap-1.5 rounded-sm px-1 hover:bg-background/10"
        aria-label="Node aktif"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        {node.id}
        <span className="text-background/50">({node.cpuPercent}% CPU)</span>
      </button>

      <span className="px-1" title="AI provider siap">
        🤖 AI ready
      </span>

      <button
        type="button"
        onClick={onOpenCommand}
        className="flex items-center gap-1 rounded-sm px-1 hover:bg-background/10"
      >
        <Keyboard className="h-3 w-3" />
        ⌘K
      </button>
    </footer>
  )
}
