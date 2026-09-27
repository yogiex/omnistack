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
import { MOCK_PROJECTS } from "@/lib/mock-data"
import {
  ERROR_SEVERITIES,
  ERROR_STATUSES,
  type ErrorSeverity,
  type ErrorStatus,
} from "@/lib/mock-errors"

import type {
  ProjectFilter,
  SeverityFilter,
  StatusFilter,
} from "../_hooks/use-error-filters"

interface ErrorFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  projectFilter: ProjectFilter
  onProjectChange: (value: ProjectFilter) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  severityFilter: SeverityFilter
  onSeverityChange: (value: SeverityFilter) => void
  resultCount: number
  totalCount: number
}

export function ErrorFilterBar({
  search,
  onSearchChange,
  projectFilter,
  onProjectChange,
  statusFilter,
  onStatusChange,
  severityFilter,
  onSeverityChange,
  resultCount,
  totalCount,
}: ErrorFilterBarProps) {
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
          placeholder="Cari pesan, proyek, atau file..."
          aria-label="Cari error"
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/*
          `value` memakai `p.name`, bukan `p.id`, karena `TrackedError`
          menyimpan nama proyek, bukan id. Konsisten selama nama tidak
          berubah — kalau mulai di-rename, ganti ke `projectId`.
        */}
        <Select
          value={projectFilter}
          onValueChange={(v) => onProjectChange((v ?? "all") as ProjectFilter)}
        >
          <SelectTrigger aria-label="Filter proyek" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Proyek</SelectItem>
            {MOCK_PROJECTS.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange((v ?? "all") as StatusFilter)}
        >
          <SelectTrigger aria-label="Filter status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {ERROR_STATUSES.map((s: ErrorStatus) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={severityFilter}
          onValueChange={(v) =>
            onSeverityChange((v ?? "all") as SeverityFilter)
          }
        >
          <SelectTrigger aria-label="Filter severity" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Severity</SelectItem>
            {ERROR_SEVERITIES.map((s: ErrorSeverity) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground tabular-nums lg:ml-auto">
        {resultCount} dari {totalCount} error
      </p>
    </div>
  )
}
