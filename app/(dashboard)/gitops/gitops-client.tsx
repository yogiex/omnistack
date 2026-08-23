"use client"

import { useState } from "react"
import {
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Plus,
  ShieldCheck,
  Trash2,
  Webhook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type PreviewStatus = "LIVE" | "BUILDING" | "SLEEPING"

interface PreviewEnv {
  id: string
  branch: string
  prNumber: number
  url: string
  status: PreviewStatus
  updatedAt: string
}

const INITIAL_ENVS: PreviewEnv[] = [
  {
    id: "env-142",
    branch: "feat/new-checkout",
    prNumber: 142,
    url: "pr-142.app.omnistack.dev",
    status: "LIVE",
    updatedAt: "12 menit lalu",
  },
  {
    id: "env-143",
    branch: "fix/payment-bug",
    prNumber: 143,
    url: "pr-143.app.omnistack.dev",
    status: "BUILDING",
    updatedAt: "3 menit lalu",
  },
  {
    id: "env-144",
    branch: "feat/user-dashboard",
    prNumber: 144,
    url: "pr-144.app.omnistack.dev",
    status: "SLEEPING",
    updatedAt: "2 hari lalu",
  },
]

const STATUS_META: Record<
  PreviewStatus,
  { label: string; className?: string; dotClassName?: string }
> = {
  LIVE: {
    label: "Live",
    className: "text-green-500 border-green-500/40 bg-green-500/10",
  },
  BUILDING: {
    label: "Building",
    className: "text-yellow-500 border-yellow-500/40 bg-yellow-500/10",
    dotClassName: "animate-pulse",
  },
  SLEEPING: {
    label: "Sleeping",
    className: "text-muted-foreground border-border bg-muted",
  },
}

export function GitOpsClient() {
  const [envs, setEnvs] = useState<PreviewEnv[]>(INITIAL_ENVS)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [branchInput, setBranchInput] = useState("")
  const [nextPr, setNextPr] = useState(145)

  const handleDelete = (target: PreviewEnv) => {
    setEnvs((prev) => prev.filter((env) => env.id !== target.id))
    setConfirmDeleteId(null)
  }

  const handleCreate = () => {
    const branch = branchInput.trim()
    if (!branch) return

    setEnvs((prev) => [
      {
        id: `env-local-${nextPr}`,
        branch,
        prNumber: nextPr,
        url: `pr-${nextPr}.app.omnistack.dev`,
        status: "BUILDING",
        updatedAt: "baru saja",
      },
      ...prev,
    ])
    setNextPr((n) => n + 1)
    setBranchInput("")
    setSheetOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <GitBranch className="h-7 w-7 text-primary" />
            Preview Environments
          </h1>
          <p className="mt-1 text-muted-foreground">
            GitOps Native — setiap Pull Request otomatis mendapat environment
            preview terisolasi.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Preview Env
        </Button>
      </div>

      {/* Daftar preview environments */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Aktif ({envs.length})</CardTitle>
          <CardDescription>
            URL preview aktif selama PR terbuka dan dihapus otomatis saat merge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envs.map((env) => {
              const status = STATUS_META[env.status]
              const isConfirmingDelete = confirmDeleteId === env.id

              return (
                <div
                  key={env.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <GitPullRequest className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        #{env.prNumber}{" "}
                        <span className="font-mono text-sm">{env.branch}</span>
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {env.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {env.updatedAt}
                    </span>
                    <Badge variant="outline" className={cn("gap-1.5", status.className)}>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full bg-current",
                          status.dotClassName
                        )}
                      />
                      {status.label}
                    </Badge>

                    {isConfirmingDelete ? (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(env)}
                        >
                          Ya, Hapus
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Batal
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" disabled>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Buka URL
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setConfirmDeleteId(env.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">
                            Hapus preview #{env.prNumber}
                          </span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {envs.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada preview environment. Buat satu dari branch mana saja.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook & Branch Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhook &amp; Branch Protection
          </CardTitle>
          <CardDescription>
            Integrasi repository yang menggerakkan pipeline GitOps (read-only).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">GitHub Webhook — push</p>
              <p className="text-xs text-muted-foreground">
                Memicu build otomatis per push ke branch PR.
              </p>
            </div>
            <Badge
              variant="outline"
              className="gap-1.5 text-green-500 border-green-500/40 bg-green-500/10"
            >
              ✓ Aktif
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Branch Protection — main</p>
              <p className="text-xs text-muted-foreground">
                Merge hanya via PR dengan review disetujui & checks hijau.
              </p>
            </div>
            <Badge
              variant="outline"
              className="gap-1.5 text-primary border-primary/40 bg-primary/10"
            >
              <ShieldCheck className="h-3 w-3" />
              Protected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sheet buat preview env */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Buat Preview Environment</SheetTitle>
            <SheetDescription>
              Deploy branch ini ke environment preview terisolasi.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Nama Branch</Label>
              <Input
                id="branch-name"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="feat/nama-fitur"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Build dimulai otomatis setelah dibuat (mock).
            </p>
          </div>

          <SheetFooter>
            <Button onClick={handleCreate} disabled={!branchInput.trim()}>
              Buat Preview Env
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
