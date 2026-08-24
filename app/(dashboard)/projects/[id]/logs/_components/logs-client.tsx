"use client"

import { useMemo, useState } from "react"
import { Bug, CheckCircle2, Database, Download, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { roleAtLeast, type Role } from "@/lib/mock-data"
import type { LogCategory } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { LogFilters } from "./log-filters"
import { LogStream } from "./log-stream"
import { AILogAnalyzer } from "./ai-log-analyzer"
import { MetricsPanel } from "./metrics-panel"

interface LogsClientProps {
  projectId: string
  projectName: string
}

export function LogsClient({ projectId, projectName }: LogsClientProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<LogCategory>("runtime")
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["INFO", "WARN", "ERROR", "DEBUG"])
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false)

  const canManage = !!user && roleAtLeast(user.role, "USER")
  const isLive = activeTab === "runtime"

  const tabs = useMemo(
    () =>
      [
        { value: "runtime", label: "Runtime", icon: Bug },
        { value: "build", label: "Build", icon: CheckCircle2 },
        { value: "access", label: "Access", icon: ExternalLink },
        { value: "database", label: "Database", icon: Database },
      ] as const,
    []
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs &amp; Monitoring</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time logs, metrics, and AI-powered insights for{" "}
            <span className="font-medium text-foreground">{projectName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIAnalyzer((v) => !v)}
              className={cn("gap-2")}
            >
              <Sparkles className={cn("h-4 w-4", showAIAnalyzer && "text-purple-500")} />
              AI Analyzer
            </Button>
          )}
          {canManage && (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogCategory)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <LogFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLevels={selectedLevels}
            setSelectedLevels={setSelectedLevels}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            showPause={isLive}
          />

          <div className={cn("grid gap-4 lg:grid-cols-3", showAIAnalyzer && canManage)}>
            <div className={cn(showAIAnalyzer && canManage ? "lg:col-span-2" : "lg:col-span-3")}>
              <LogStream
                projectId={projectId}
                category={activeTab}
                searchQuery={searchQuery}
                selectedLevels={selectedLevels}
                isPaused={isPaused || !isLive}
              />
            </div>

            {showAIAnalyzer && canManage && (
              <AILogAnalyzer projectId={projectId} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <MetricsPanel projectId={projectId} />
    </div>
  )
}
