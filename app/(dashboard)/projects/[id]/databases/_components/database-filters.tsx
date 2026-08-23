"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DatabaseEngine, DatabaseStatus } from "@/lib/mock-data"

interface DatabaseFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  engine: DatabaseEngine | "ALL"
  onEngineChange: (v: DatabaseEngine | "ALL") => void
  status: DatabaseStatus | "ALL"
  onStatusChange: (v: DatabaseStatus | "ALL") => void
}

const ENGINE_OPTIONS: Array<{ value: DatabaseEngine | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "POSTGRES", label: "PostgreSQL" },
  { value: "MYSQL", label: "MySQL" },
  { value: "REDIS", label: "Redis" },
  { value: "MONGODB", label: "MongoDB" },
]

const STATUS_OPTIONS: Array<{
  value: DatabaseStatus | "ALL"
  label: string
}> = [
  { value: "ALL", label: "Semua" },
  { value: "HEALTHY", label: "Sehat" },
  { value: "BACKUPING", label: "Mem-backup" },
  { value: "ERROR", label: "Error" },
  { value: "MAINTENANCE", label: "Pemeliharaan" },
]

export function DatabaseFilters({
  search,
  onSearchChange,
  engine,
  onEngineChange,
  status,
  onStatusChange,
}: DatabaseFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari database..."
          aria-label="Cari database"
          className="pl-9"
        />
      </div>

      <Select
        value={engine}
        onValueChange={(v) => onEngineChange(v as DatabaseEngine | "ALL")}
      >
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter engine">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ENGINE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as DatabaseStatus | "ALL")}
      >
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
