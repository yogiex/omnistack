"use client"

import { SiGithub, SiGitlab } from "react-icons/si"
import { BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface IntegrationsTabProps {
  isViewer: boolean
  gitlabNotice: boolean
  onConnectGitLab: () => void
}

export function IntegrationsTab({
  isViewer,
  gitlabNotice,
  onConnectGitLab,
}: IntegrationsTabProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Integrasi Git</CardTitle>
        <CardDescription>
          Hubungkan akun Git Anda untuk import repositori &amp; deploy otomatis.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <SiGithub className="size-6" aria-hidden="true" />
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                GitHub
                <span className="flex items-center gap-1.5 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                  <span
                    className="size-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  Terhubung (dev-user)
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Import repo &amp; webhook aktif.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled={isViewer}>
            Kelola Repos
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <SiGitlab className="size-6 text-orange-500" aria-hidden="true" />
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                GitLab
                <span className="text-xs font-normal text-muted-foreground">
                  Belum Terhubung
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Hubungkan untuk import proyek dari GitLab.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onConnectGitLab}
            disabled={isViewer}
          >
            Connect
          </Button>
        </div>

        {gitlabNotice && (
          <p
            role="status"
            className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <BadgeCheck aria-hidden="true" />
            Mock: OAuth GitLab akan dibuka di mode produksi.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
