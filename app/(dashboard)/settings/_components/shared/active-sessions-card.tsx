"use client"

import { BadgeCheck, LogOut, MonitorSmartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MOCK_SESSIONS } from "@/lib/settings/mock-settings"
import { cn } from "@/lib/utils"

interface ActiveSessionsCardProps {
  isViewer: boolean
  onRevokeOthers: () => void
  showNotice: boolean
}

export function ActiveSessionsCard({
  isViewer,
  onRevokeOthers,
  showNotice,
}: ActiveSessionsCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <MonitorSmartphone
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Sesi Aktif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ul className="space-y-2">
          {MOCK_SESSIONS.map((s) => (
            <li key={s.id} className="flex items-start gap-2">
              <BadgeCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-muted-foreground">
                {s.device}
                <span
                  className={cn(
                    "ml-1 text-xs",
                    s.current &&
                      "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  · {s.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isViewer}
          onClick={onRevokeOthers}
        >
          <LogOut />
          Cabut Semua Sesi Lain
        </Button>

        {showNotice && (
          <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <BadgeCheck aria-hidden="true" />
            Mock: semua sesi lain telah dicabut.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
