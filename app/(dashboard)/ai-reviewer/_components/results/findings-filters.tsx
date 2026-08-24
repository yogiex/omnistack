"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface FindingsFiltersProps {
  onFilterChange: (severity: string, search: string) => void
}

export function FindingsFilters({ onFilterChange }: FindingsFiltersProps) {
  const [severity, setSeverity] = useState("all")
  const [search, setSearch] = useState("")

  const handleSeverityChange = (value: string | null) => {
    const next = value ?? "all"
    setSeverity(next)
    onFilterChange(next, search)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    onFilterChange(severity, value)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={severity} onValueChange={handleSeverityChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Severities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Critical">🔴 Critical</SelectItem>
          <SelectItem value="High">🟠 High</SelectItem>
          <SelectItem value="Medium">🟡 Medium</SelectItem>
          <SelectItem value="Low">🔵 Low</SelectItem>
          <SelectItem value="Info">⚪ Info</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search findings..."
          value={search}
          onChange={handleSearchChange}
          className="w-[240px] pl-8"
        />
      </div>
    </div>
  )
}
