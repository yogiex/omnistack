"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ENGINE_META,
  MOCK_PROJECTS,
  type DatabaseEngine,
  type DatabaseStatus,
} from "@/lib/mock-data"

import type {
  EngineFilter,
  ProjectFilter,
  StatusFilter,
} from "../_hooks/use-database-filters"

const STATUS_LABEL: Record<DatabaseStatus, string> = {
  HEALTHY: "Sehat",
  BACKUPING: "Mem-backup",
  ERROR: "Error",
  MAINTENANCE: "Pemeliharaan",
}

const ALL = "ALL"

const ENGINE_OPTIONS = Object.keys(ENGINE_META) as DatabaseEngine[]
const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as DatabaseStatus[]

interface DatabasesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  projectFilter: ProjectFilter
  onProjectChange: (value: ProjectFilter) => void
  engineFilter: EngineFilter
  onEngineChange: (value: EngineFilter) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
}

export function DatabasesToolbar({
  search,
  onSearchChange,
  projectFilter,
  onProjectChange,
  engineFilter,
  onEngineChange,
  statusFilter,
  onStatusChange,
}: DatabasesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative lg:max-w-xs lg:flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama database..."
          aria-label="Cari database"
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          value={projectFilter}
          onValueChange={(v) => onProjectChange(v as ProjectFilter)}
        >
          <SelectTrigger aria-label="Filter proyek" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua Proyek</SelectItem>
            {MOCK_PROJECTS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={engineFilter}
          onValueChange={(v) => onEngineChange(v as EngineFilter)}
        >
          <SelectTrigger aria-label="Filter engine" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua Tipe</SelectItem>
            {ENGINE_OPTIONS.map((engine) => (
              <SelectItem key={engine} value={engine}>
                {ENGINE_META[engine].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as StatusFilter)}
        >
          <SelectTrigger aria-label="Filter status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua Status</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABEL[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
