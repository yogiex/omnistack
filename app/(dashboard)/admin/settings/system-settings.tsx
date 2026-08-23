"use client"

import { useState } from "react"
import {
  Check,
  CheckCircle,
  Copy,
  DatabaseBackup,
  GitBranch,
  Globe,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  Webhook,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const OAUTH_PROVIDERS = [
  {
    id: "github",
    label: "GitHub",
    hint: "Login & repo access",
    icon: GitBranch,
    clientId: "gh_xxxxxxxx",
    connected: true,
  },
  {
    id: "google",
    label: "Google Workspace",
    hint: "SSO korporat",
    icon: Globe,
    clientId: "gw_xxxxxxxx",
    connected: false,
  },
  {
    id: "gitlab",
    label: "GitLab",
    hint: "Repo self-hosted",
    icon: GitBranch,
    clientId: "gl_xxxxxxxx",
    connected: false,
  },
]

const GLOBAL_API_KEYS = [
  { id: "key-01", label: "Deploy Hook CI", masked: "osk_live_••••••••7f2a" },
  { id: "key-02", label: "Webhook Billing", masked: "osk_live_••••••••b91c" },
  { id: "key-03", label: "Integrasi Monitoring", masked: "osk_test_••••••••04dd" },
]

interface EnvVar {
  id: string
  key: string
  value: string
}

const INITIAL_ENV_VARS: EnvVar[] = [
  { id: "env-1", key: "NEXT_PUBLIC_API_URL", value: "api.omnistack.dev" },
  { id: "env-2", key: "LOG_LEVEL", value: "info" },
]

export function SystemSettingsForm() {
  const [saved, setSaved] = useState(false)
  const [savedTab, setSavedTab] = useState<string | null>(null)
  const [maintenance, setMaintenance] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<EnvVar[]>(INITIAL_ENV_VARS)
  const [webhooks, setWebhooks] = useState<Record<string, boolean>>({
    deployHook: true,
    billingEvents: false,
  })

  const [oauthStatus, setOauthStatus] = useState<Record<string, boolean>>({
    github: true,
    google: false,
    gitlab: false,
  })

  const [smtpTesting, setSmtpTesting] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<"success" | null>(null)

  const handleAddEnvVar = () => {
    setEnvVars((prev) => [...prev, { id: `env-${Date.now()}`, key: "", value: "" }])
  }

  const handleRemoveEnvVar = (id: string) => {
    setEnvVars((prev) => prev.filter((envVar) => envVar.id !== id))
  }

  const handleEnvVarChange = (id: string, field: "key" | "value", val: string) => {
    setEnvVars((prev) =>
      prev.map((envVar) => (envVar.id === id ? { ...envVar, [field]: val } : envVar))
    )
  }

  const handleSave = (tab?: string) => {
    if (tab) {
      setSavedTab(tab)
      setTimeout(() => setSavedTab(null), 2000)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleCopyKey = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // abaikan di demo
    }
  }

  const handleTestSmtp = () => {
    setSmtpTesting(true)
    setSmtpTestResult(null)
    setTimeout(() => {
      setSmtpTesting(false)
      setSmtpTestResult("success")
    }, 1000)
  }

  const handleToggleOAuth = (providerId: string) => {
    setOauthStatus((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Settings2 className="h-7 w-7 text-primary" />
            System Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Konfigurasi tingkat sistem — hanya dapat diubah oleh ADMIN.
          </p>
        </div>
        <Button onClick={() => handleSave()}>
          {saved && <Check className="mr-2 h-4 w-4" />}
          {saved ? "Tersimpan" : "Simpan Semua"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line">
          <TabsTrigger value="general">
            <Settings2 className="mr-1.5 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="smtp">
            <Mail className="mr-1.5 h-4 w-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <KeyRound className="mr-1.5 h-4 w-4" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <KeyRound className="mr-1.5 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-1.5 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup">
            <DatabaseBackup className="mr-1.5 h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Pengaturan dasar platform yang mempengaruhi semua user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="OmniStack" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-role">Default Role for New Users</Label>
                  <select
                    id="default-role"
                    defaultValue="USER"
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none md:text-sm dark:bg-input/30"
                  >
                    <option value="USER">USER</option>
                    <option value="VIEWER">VIEWER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-projects">Max Projects per User</Label>
                  <Input
                    id="max-projects"
                    type="number"
                    defaultValue={10}
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Menonaktifkan akses semua user non-ADMIN.
                  </p>
                  {maintenance && (
                    <Badge variant="outline" className="mt-2 text-muted-foreground border-border">
                      Aktif — sistem dalam maintenance
                    </Badge>
                  )}
                </div>
                <Checkbox
                  checked={maintenance}
                  onCheckedChange={(checked) => setMaintenance(checked === true)}
                  aria-label="Toggle maintenance mode"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("general")}>
                  {savedTab === "general" && <Check className="mr-2 h-4 w-4" />}
                  {savedTab === "general" ? "Tersimpan" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                SMTP Email
              </CardTitle>
              <CardDescription>
                Konfigurasi email untuk verifikasi akun, reset password, dan notifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" defaultValue="smtp.omnistack.dev" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input id="smtp-port" defaultValue="587" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Username</Label>
                  <Input id="smtp-user" defaultValue="no-reply@omnistack.dev" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">Password</Label>
                  <Input id="smtp-pass" type="password" defaultValue="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-from">Alamat From</Label>
                  <Input id="smtp-from" defaultValue="OmniStack <no-reply@omnistack.dev>" />
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleTestSmtp}
                  disabled={smtpTesting}
                >
                  {smtpTesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {smtpTesting ? "Mengujicoba..." : "Test Connection"}
                </Button>
                {smtpTestResult === "success" && (
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    Koneksi SMTP berhasil (mock)
                  </Badge>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("smtp")}>
                  {savedTab === "smtp" && <Check className="mr-2 h-4 w-4" />}
                  {savedTab === "smtp" ? "Tersimpan" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OAUTH_PROVIDERS.map((provider) => {
              const Icon = provider.icon
              const isConnected = oauthStatus[provider.id]
              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        {provider.label}
                      </CardTitle>
                      <Badge
                        variant={isConnected ? "outline" : "secondary"}
                        className={cn(
                          isConnected
                            ? "text-muted-foreground border-border"
                            : "text-muted-foreground"
                        )}
                      >
                        {isConnected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    <CardDescription>{provider.hint}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Client ID</Label>
                      <Input
                        defaultValue={provider.clientId}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        defaultValue="••••••••••••••••"
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleToggleOAuth(provider.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleOAuth(provider.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  API Keys Global
                </CardTitle>
                <CardDescription>
                  Key untuk integrasi lintas sistem (CI hooks, billing, monitoring).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {GLOBAL_API_KEYS.map((key) => (
                  <div
                    key={key.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{key.label}</p>
                      <code className="font-mono text-xs text-muted-foreground">
                        {key.masked}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyKey(key.id, key.masked)}
                    >
                      {copiedId === key.id ? (
                        <>
                          <Check className="mr-2 h-3.5 w-3.5" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Salin
                        </>
                      )}
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Rotasi key direkomendasikan setiap kuartal (lihat Security Best Practices).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Webhook Integrations
                </CardTitle>
                <CardDescription>
                  Integrasi webhook untuk event deployment dan billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Deploy Hook</p>
                    <p className="text-xs text-muted-foreground">
                      Panggil URL eksternal setiap deployment sukses.
                    </p>
                  </div>
                  <Checkbox
                    checked={webhooks.deployHook}
                    onCheckedChange={(checked) =>
                      setWebhooks((prev) => ({ ...prev, deployHook: checked === true }))
                    }
                    aria-label="Toggle deploy hook"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Billing Events</p>
                    <p className="text-xs text-muted-foreground">
                      Notifikasi webhook saat ada event tagihan atau kuota.
                    </p>
                  </div>
                  <Checkbox
                    checked={webhooks.billingEvents}
                    onCheckedChange={(checked) =>
                      setWebhooks((prev) => ({ ...prev, billingEvents: checked === true }))
                    }
                    aria-label="Toggle billing events"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Environment Variables Global
              </CardTitle>
              <CardDescription>
                Variabel yang tersedia di semua aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {envVars.map((envVar) => (
                <div key={envVar.id} className="flex items-center gap-2">
                  <Input
                    value={envVar.key}
                    onChange={(e) => handleEnvVarChange(envVar.id, "key", e.target.value)}
                    placeholder="NAMA_VAR"
                    className="font-mono sm:max-w-[220px]"
                    aria-label="Nama variabel"
                  />
                  <span className="text-sm text-muted-foreground">=</span>
                  <Input
                    value={envVar.value}
                    onChange={(e) => handleEnvVarChange(envVar.id, "value", e.target.value)}
                    placeholder="nilai"
                    className="font-mono"
                    aria-label="Nilai variabel"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveEnvVar(envVar.id)}
                    aria-label={`Hapus ${envVar.key || "variabel"}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddEnvVar}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Tambah Variabel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Pengaturan keamanan platform untuk melindungi semua user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">2FA Enforcement</p>
                  <p className="text-xs text-muted-foreground">
                    Wajibkan 2FA untuk semua ADMIN
                  </p>
                </div>
                <Checkbox defaultChecked aria-label="Wajibkan 2FA untuk admin" />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={480}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-logout setelah periode tidak aktif.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Password Policy</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 8 characters, must include uppercase + number
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("security")}>
                  {savedTab === "security" && <Check className="mr-2 h-4 w-4" />}
                  {savedTab === "security" ? "Tersimpan" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseBackup className="h-5 w-5 text-primary" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>
                Pengaturan backup otomatis dan retensi data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Backup Otomatis Harian</p>
                  <p className="text-xs text-muted-foreground">
                    Backup otomatis ke S3 setiap hari.
                  </p>
                </div>
                <Checkbox defaultChecked aria-label="Toggle backup harian" />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backup-schedule">Backup Schedule</Label>
                  <select
                    id="backup-schedule"
                    defaultValue="daily-0200-utc"
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none md:text-sm dark:bg-input/30"
                  >
                    <option value="daily-0200-utc">Daily at 02:00 UTC</option>
                    <option value="weekly-sunday">Weekly on Sunday</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Policy (hari)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    defaultValue={30}
                    min={7}
                    max={365}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Last Backup</p>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="outline" className="border-border">
                    22 Aug 2026, 02:00 UTC — Success
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("backup")}>
                  {savedTab === "backup" && <Check className="mr-2 h-4 w-4" />}
                  {savedTab === "backup" ? "Tersimpan" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
