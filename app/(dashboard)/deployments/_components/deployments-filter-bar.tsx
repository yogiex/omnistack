"use client"

import { LayoutGrid, List, RotateCcw, Search } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { MockProject } from "@/lib/mock-data"

export type DeployView = "list" | "timeline"

interface DeploymentsFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  projectFilter: string
  onProjectFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  environmentFilter: string
  onEnvironmentFilterChange: (value: string) => void
  dateSort: string
  onDateSortChange: (value: string) => void
  view: DeployView
  onViewChange: (view: DeployView) => void
  projects: MockProject[]
  onReset: () => void
  isViewer: boolean
  onCreateNew: () => void
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "success", label: "Success" },
  { value: "building", label: "Building" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
  { value: "rolled_back", label: "Rolled Back" },
]

const ENVIRONMENT_OPTIONS = [
  { value: "all", label: "All Environments" },
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "preview", label: "Preview" },
]

const DATE_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]

export function DeploymentsFilterBar({
  searchQuery,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  statusFilter,
  onStatusFilterChange,
  environmentFilter,
  onEnvironmentFilterChange,
  dateSort,
  onDateSortChange,
  view,
  onViewChange,
  projects,
  onReset,
  isViewer,
  onCreateNew,
}: DeploymentsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] max-w-sm flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, branches..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={projectFilter} onValueChange={(v) => onProjectFilterChange(v ?? "all")}>
        <SelectTrigger className="w-[150px]" aria-label="Filter by project">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v ?? "all")}>
        <SelectTrigger className="w-[130px]" aria-label="Filter by status">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={environmentFilter} onValueChange={(v) => onEnvironmentFilterChange(v ?? "all")}>
        <SelectTrigger className="w-[150px]" aria-label="Filter by environment">
          <SelectValue placeholder="All Environments" />
        </SelectTrigger>
        <SelectContent>
          {ENVIRONMENT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateSort} onValueChange={(v) => onDateSortChange(v ?? "newest")}>
        <SelectTrigger className="w-[120px]" aria-label="Sort by date">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex overflow-hidden rounded-lg border" role="group">
        <button
          type="button"
          aria-label="List view"
          onClick={() => onViewChange("list")}
          className={cn(
            buttonVariants({ variant: view === "list" ? "secondary" : "ghost", size: "sm" }),
            "rounded-none"
          )}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Timeline view"
          onClick={() => onViewChange("timeline")}
          className={cn(
            buttonVariants({ variant: view === "timeline" ? "secondary" : "ghost", size: "sm" }),
            "rounded-none"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>

      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>

      {!isViewer && (
        <Button size="sm" onClick={onCreateNew}>
          New Deployment
        </Button>
      )}
    </div>
  )
}