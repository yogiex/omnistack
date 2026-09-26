import Link from "next/link"
import { AlertCircle, AlertTriangle, ArrowRight, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Severity = "high" | "medium" | "low"

interface AlertItem {
  id: string
  severity: Severity
  message: string
  href: string
}

const ALERTS: AlertItem[] = [
  {
    id: "al-1",
    severity: "high",
    message: "3 deploy failures dalam 24 jam terakhir",
    href: "/deployments",
  },
  {
    id: "al-2",
    severity: "medium",
    message: "Storage usage mencapai 85%",
    href: "/admin/infrastructure",
  },
  {
    id: "al-3",
    severity: "low",
    message: "2 users belum mengaktifkan 2FA",
    href: "/admin/users",
  },
]

const SEVERITY_CONFIG: Record<
  Severity,
  {
    label: string
    icon: typeof AlertCircle
    iconClass: string
    badgeClass: string
  }
> = {
  high: {
    label: "High",
    icon: AlertCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  medium: {
    label: "Medium",
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  low: {
    label: "Low",
    icon: Info,
    iconClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
}

export function AlertsPanel({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Alerts &amp; Warnings</CardTitle>
        <CardDescription>Peringatan aktif dari sistem</CardDescription>
        <CardAction>
          <Link
            href="/admin/audit"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-muted-foreground hover:text-foreground"
            )}
          >
            Semua
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {ALERTS.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity]
          const Icon = config.icon

          return (
            <Link
              key={alert.id}
              href={alert.href}
              className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
                <Icon
                  aria-hidden="true"
                  className={cn("mt-0.5 size-4 shrink-0", config.iconClass)}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      config.badgeClass
                    )}
                  >
                    {config.label}
                  </span>
                  <p className="text-sm leading-snug">{alert.message}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
