"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FindingsList } from "./findings-list"
import { FindingsFilters } from "./findings-filters"
import { OverviewTab } from "./overview-tab"
import type { Review, Finding } from "../types"

interface ResultsTabsProps {
  review: Review
  findings: Finding[]
  onSelectFinding: (id: string) => void
}

export function ResultsTabs({
  review,
  findings,
  onSelectFinding,
}: ResultsTabsProps) {
  const [filteredSeverity, setFilteredSeverity] = useState("all")
  const [filteredSearch, setFilteredSearch] = useState("")

  const securityCount = review.severity.Critical + review.severity.High

  const filteredFindings = findings.filter((f) => {
    const matchesSeverity =
      filteredSeverity === "all" || f.severity === filteredSeverity
    const matchesSearch =
      filteredSearch === "" ||
      f.message.toLowerCase().includes(filteredSearch.toLowerCase()) ||
      f.cwe.toLowerCase().includes(filteredSearch.toLowerCase()) ||
      f.file.toLowerCase().includes(filteredSearch.toLowerCase())
    return matchesSeverity && matchesSearch
  })

  const handleFilterChange = (severity: string, search: string) => {
    setFilteredSeverity(severity)
    setFilteredSearch(search)
  }

  return (
    <Tabs defaultValue="security">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="security">
          Security ({securityCount})
          {review.severity.Critical > 0 && (
            <span className="ml-1 text-destructive">🔴</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="quality">Code Quality</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab review={review} />
      </TabsContent>
      <TabsContent value="security">
        <div className="flex flex-col gap-4">
          <FindingsFilters onFilterChange={handleFilterChange} />
          <FindingsList
            findings={filteredFindings}
            onSelectFinding={onSelectFinding}
          />
        </div>
      </TabsContent>
      <TabsContent value="quality">
        <div className="rounded-lg border p-6 text-center text-muted-foreground">
          Coming in v2
        </div>
      </TabsContent>
    </Tabs>
  )
}
