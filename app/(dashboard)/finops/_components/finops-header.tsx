"use client"

import { Download, RefreshCw } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const SUBTITLE_BY_ROLE: Record<Role, string> = {
  ADMIN: "Biaya infrastruktur seluruh sistem.",
  USER: "Biaya infrastruktur proyek yang Anda miliki.",
  VIEWER: "Read-only · tidak dapat mengubah anggaran.",
}

const EXPORT_BACKEND_REASON = "Segera hadir · belum ada backend export"

const EXPORT_ITEMS: { label: string; format: string }[] = [
  { label: "Ringkasan Bulanan", format: "PDF" },
  { label: "Rincian per Proyek", format: "CSV" },
  { label: "Faktur Klien", format: "PDF" },
  { label: "Data Mentah", format: "JSON" },
]

interface FinOpsHeaderProps {
  role: Role
  activeAlerts: number
  criticalAlerts: number
  lastSyncLabel: string
}

export function FinOpsHeader({
  role,
  activeAlerts,
  criticalAlerts,
  lastSyncLabel,
}: FinOpsHeaderProps) {
  const hasCritical = criticalAlerts > 0

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">FinOps</h1>
        <p className="text-sm text-muted-foreground">
          {SUBTITLE_BY_ROLE[role]}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeAlerts > 0 && (
          <a
            href="#budget-alerts"
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {activeAlerts} alert aktif
            {hasCritical && (
              <span className="text-red-600 dark:text-red-400">
                {" "}
                · {criticalAlerts} kritis
              </span>
            )}
          </a>
        )}

        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Sinkron terakhir {lastSyncLabel}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="size-4" aria-hidden="true" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Format laporan</DropdownMenuLabel>
            {EXPORT_ITEMS.map((item) => (
              <DropdownMenuItem
                key={item.label}
                disabled
                className="flex-col items-start gap-0.5 py-2"
              >
                <span>
                  {item.label} · {item.format}
                </span>
                <span className="text-xs text-muted-foreground">
                  {EXPORT_BACKEND_REASON}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                document
                  .getElementById("export-reports")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              <Download className="size-4" aria-hidden="true" />
              Buka panel Export &amp; Reports
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
