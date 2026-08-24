"use client"

import {
  Bug,
  FileCode2,
  Search,
  Settings,
  Sparkles,
  Blocks,
  GitBranch,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type RightMode = "preview" | "ai" | "metrics"

interface IdeActivityBarProps {
  explorerOpen: boolean
  rightOpen: boolean
  rightMode: RightMode
  onToggleExplorer: () => void
  onToggleRight: () => void
}

interface Item {
  id: string
  label: string
  icon: typeof Search
  shortcut: string
  active: boolean
  onClick: () => void
}

export function IdeActivityBar({
  explorerOpen,
  rightOpen,
  rightMode,
  onToggleExplorer,
  onToggleRight,
}: IdeActivityBarProps) {
  const items: Item[] = [
    {
      id: "explorer",
      label: "Explorer",
      icon: FileCode2,
      shortcut: "⌘⇧E",
      active: explorerOpen && rightMode !== "ai",
      onClick: onToggleExplorer,
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      shortcut: "⌘⇧F",
      active: false,
      onClick: onToggleExplorer,
    },
    {
      id: "git",
      label: "Git",
      icon: GitBranch,
      shortcut: "⌘⇧G",
      active: false,
      onClick: onToggleExplorer,
    },
    {
      id: "ai",
      label: "AI Pilot",
      icon: Sparkles,
      shortcut: "⌘⇧A",
      active: rightOpen && rightMode === "ai",
      onClick: () => onToggleRight(),
    },
  ]

  const buttonClass = (active: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      active && "bg-accent text-foreground"
    )

  return (
    <nav className="flex w-11 shrink-0 flex-col items-center gap-1 border-r bg-muted/30 py-2">
      {items.map((item) => (
        <Tooltip key={item.id}>
          <TooltipTrigger
            aria-label={item.label}
            aria-pressed={item.active}
            className={buttonClass(item.active)}
            onClick={item.onClick}
          >
            <item.icon className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
            <kbd className="ml-1.5 font-mono text-[10px]">{item.shortcut}</kbd>
          </TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger aria-label="Run & Debug" className={buttonClass(false)}>
          <Bug className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent side="right">Run &amp; Debug</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger aria-label="Stack Builder" className={buttonClass(false)}>
          <Blocks className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent side="right">Stack Builder</TooltipContent>
      </Tooltip>

      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger aria-label="Settings" className={buttonClass(false)}>
            <Settings className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
