"use client"

import { useState } from "react"
import {
  Bot,
  Check,
  Coins,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Users,
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface Provider {
  id: string
  name: string
  enabled: boolean
  apiKey: string
  model: string
}

const INITIAL_PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", enabled: true, apiKey: "sk-••••••••••••••••7f2a", model: "gpt-4o" },
  { id: "claude", name: "Claude (Anthropic)", enabled: false, apiKey: "sk-ant-••••••••••••b91c", model: "claude-sonnet-4-20250514" },
]

interface RoleLimit {
  role: string
  label: string
  dailyLimit: number
  icon: typeof ShieldCheck
  color: string
}

const INITIAL_LIMITS: RoleLimit[] = [
  { role: "ADMIN", label: "Administrator", dailyLimit: -1, icon: ShieldCheck, color: "text-amber-500" },
  { role: "USER", label: "Developer", dailyLimit: 100, icon: Users, color: "text-blue-500" },
  { role: "VIEWER", label: "Viewer", dailyLimit: 0, icon: Eye, color: "text-emerald-500" },
]

const USAGE_STATS = [
  { label: "Token Hari Ini", value: "12,450", icon: Coins, color: "text-primary" },
  { label: "Request Hari Ini", value: "84", icon: Loader2, color: "text-blue-500" },
  { label: "Estimasi Biaya", value: "$0.47", icon: Coins, color: "text-green-500" },
]

const AI_HISTORY = [
  { user: "Admin OmniStack", prompt: "Buat API endpoint untuk autentikasi user", tokens: 1240, timeLabel: "10 menit lalu" },
  { user: "Developer OmniStack", prompt: "Review kode React component ini...", tokens: 890, timeLabel: "25 menit lalu" },
  { user: "Admin OmniStack", prompt: "Generate migration script untuk schema...", tokens: 2100, timeLabel: "1 jam lalu" },
  { user: "Developer OmniStack", prompt: "Jelaskan perbedaan goroutine dan channel", tokens: 560, timeLabel: "2 jam lalu" },
  { user: "Admin OmniStack", prompt: "Optimasi query SQL untuk dashboard analytics", tokens: 1800, timeLabel: "3 jam lalu" },
]

export function AiConfigClient() {
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS)
  const [limits, setLimits] = useState<RoleLimit[]>(INITIAL_LIMITS)
  const [saved, setSaved] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  const updateLimit = (role: string, value: number) => {
    setLimits((prev) =>
      prev.map((l) => (l.role === role ? { ...l, dailyLimit: value } : l))
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Bot className="h-7 w-7 text-primary" />
            AI Configuration
          </h1>
          <p className="mt-1 text-muted-foreground">
            Konfigurasi provider AI, batas penggunaan, dan pantau aktivitas
          </p>
        </div>
        <Button onClick={handleSave}>
          {saved && <Check className="mr-2 h-4 w-4" />}
          {saved ? "Tersimpan" : "Simpan Semua"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {USAGE_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              AI Providers
            </CardTitle>
            <CardDescription>
              Aktifkan atau nonaktifkan provider AI, kelola API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted font-mono text-xs font-bold">
                      {provider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.model}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleProvider(provider.id)}
                    className="cursor-pointer"
                    aria-label={`${provider.enabled ? "Nonaktifkan" : "Aktifkan"} ${provider.name}`}
                  >
                    {provider.enabled ? (
                      <ToggleRight className="h-8 w-8 text-primary" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={visibleKeys[provider.id] ? "text" : "password"}
                      value={provider.apiKey}
                      readOnly
                      className="pr-9 font-mono text-xs"
                    />
                    <button
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle API key visibility"
                    >
                      {visibleKeys[provider.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Badge variant="outline" className={provider.enabled ? "text-green-500" : "text-muted-foreground"}>
                    {provider.enabled ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Batas Penggunaan per Role
            </CardTitle>
            <CardDescription>
              Atur kuota harian AI untuk setiap role pengguna
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {limits.map((limit) => {
              const Icon = limit.icon
              return (
                <div key={limit.role} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${limit.color}`} />
                    <div>
                      <p className="text-sm font-medium">{limit.label}</p>
                      <p className="text-xs text-muted-foreground">{limit.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={limit.dailyLimit === -1 ? "" : limit.dailyLimit}
                      onChange={(e) => {
                        const val = e.target.value === "" ? -1 : parseInt(e.target.value, 10)
                        updateLimit(limit.role, isNaN(val) ? 0 : val)
                      }}
                      disabled={limit.role === "ADMIN"}
                      placeholder="Unlimited"
                      className="w-24 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">/hari</span>
                  </div>
                </div>
              )
            })}

            <Separator />

            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>ADMIN:</strong> Unlimited (tidak ada batasan) &bull;{" "}
                <strong>USER:</strong> 100 request/hari &bull;{" "}
                <strong>VIEWER:</strong> 0 (tidak ada akses AI)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Riwayat Penggunaan AI — Semua User
          </CardTitle>
          <CardDescription>
            Pantau aktivitas AI dari seluruh pengguna platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Prompt</th>
                  <th className="pb-2 font-medium text-right">Tokens</th>
                  <th className="pb-2 font-medium text-right">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {AI_HISTORY.map((entry, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 font-medium">{entry.user}</td>
                    <td className="max-w-[280px] truncate py-3 text-muted-foreground">
                      {entry.prompt}
                    </td>
                    <td className="py-3 text-right font-mono text-xs">
                      {entry.tokens.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-xs text-muted-foreground">
                      {entry.timeLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
