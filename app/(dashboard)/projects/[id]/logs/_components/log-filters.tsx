"use client"

import { Filter, Pause, Play, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ALL_LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"] as const

const LEVEL_COLORS: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-500 border-blue-500/50",
  WARN: "bg-amber-500/10 text-amber-500 border-amber-500/50",
  ERROR: "bg-red-500/10 text-red-500 border-red-500/50",
  DEBUG: "bg-muted text-muted-foreground border-border",
}

interface LogFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedLevels: string[]
  setSelectedLevels: (levels: string[]) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  showPause: boolean
}

export function LogFilters({
  searchQuery,
  setSearchQuery,
  selectedLevels,
  setSelectedLevels,
  isPaused,
  setIsPaused,
  showPause,
}: LogFiltersProps) {
  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== level))
    } else {
      setSelectedLevels([...selectedLevels, level])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs... (grep-like)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-10"
          />
        </div>

        {showPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className={cn("gap-2", isPaused && "bg-amber-500/10 text-amber-500")}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("")}
          className="gap-2"
          disabled={searchQuery === ""}
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Levels:</span>
        {ALL_LEVELS.map((level) => (
          <Badge
            key={level}
            variant="outline"
            onClick={() => toggleLevel(level)}
            className={cn(
              "cursor-pointer select-none transition-all",
              selectedLevels.includes(level)
                ? LEVEL_COLORS[level]
                : "opacity-40"
            )}
          >
            {level}
          </Badge>
        ))}
      </div>
    </div>
  )
}
