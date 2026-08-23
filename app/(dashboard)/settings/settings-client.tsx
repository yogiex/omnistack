"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Check,
  Copy,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { SiGithub, SiGitlab } from "react-icons/si"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const PERMISSION_SUMMARY: Record<Role, string[]> = {
  ADMIN: [
    "Kelola semua user & role",
    "Akses semua proyek & deployment",
    "Lihat audit logs",
    "Ubah system settings",
  ],
  USER: [
    "CRUD proyek milik sendiri",
    "Deploy & rollback proyek sendiri",
    "Gunakan AI Architect",
    "Unduh laporan miliknya",
  ],
  VIEWER: [
    "Melihat dashboard & monitoring",
    "Membaca log deployment",
    "Unduh laporan FinOps",
    "Tidak ada aksi tulis apa pun",
  ],
}

const ROLE_META: Record<
  Role,
  { label: string; description: string; color: string; bgColor: string }
> = {
  ADMIN: {
    label: "Administrator",
    description: "Akses penuh ke seluruh sistem",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  USER: {
    label: "Developer",
    description: "Kelola proyek & deployment Anda",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  VIEWER: {
    label: "Viewer",
    description: "Akses read-only untuk monitoring",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
}

interface ApiKeyItem {
  id: string
  name: string
  fullKey: string
  createdAt: string
}

const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: "key-1",
    name: "Production Deploy",
    fullKey: "osk_live_9f8e7d6c5b4a3210",
    createdAt: "12 Jan 2026",
  },
  {
    id: "key-2",
    name: "CI Pipeline",
    fullKey: "osk_test_1a2b3c4d5e6f7788",
    createdAt: "03 Mar 2026",
  },
  {
    id: "key-3",
    name: "Local Development",
    fullKey: "osk_dev_aa11bb22cc33dd44",
    createdAt: "21 Jun 2026",
  },
]

function maskKey(fullKey: string): string {
  return `${fullKey.slice(0, 9)}••••${fullKey.slice(-4)}`
}

function generateMockKey(): ApiKeyItem {
  const chars = "abcdef0123456789"
  let suffix = ""
  for (let i = 0; i < 16; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return {
    id: `key-${Date.now()}`,
    name: "Untitled Key",
    fullKey: `osk_live_${suffix}`,
    createdAt: "Baru saja",
  }
}

interface NotifPrefs {
  deploymentAlerts: boolean
  systemAlerts: boolean
  marketingEmails: boolean
  realtimeAlerts: boolean
  dailyDigest: boolean
}

const INITIAL_NOTIF_PREFS: NotifPrefs = {
  deploymentAlerts: true,
  systemAlerts: true,
  marketingEmails: false,
  realtimeAlerts: true,
  dailyDigest: true,
}

const NOTIF_OPTION_GROUPS: {
  group: string
  options: { key: keyof NotifPrefs; label: string }[]
}[] = [
  {
    group: "Notifikasi Email",
    options: [
      { key: "deploymentAlerts", label: "Deployment alerts" },
      { key: "systemAlerts", label: "System alerts" },
      { key: "marketingEmails", label: "Marketing emails" },
    ],
  },
  {
    group: "Notifikasi In-App",
    options: [
      { key: "realtimeAlerts", label: "Real-time alerts" },
      { key: "dailyDigest", label: "Daily digest" },
    ],
  },
]

interface MockSession {
  id: string
  device: string
  detail: string
  current: boolean
}

const MOCK_SESSIONS: MockSession[] = [
  { id: "sess-1", device: "Chrome on MacOS", detail: "Sesi saat ini", current: true },
  { id: "sess-2", device: "Safari on iPhone", detail: "2 jam lalu", current: false },
]

const LANGUAGE_OPTIONS = [
  { value: "id", label: "Indonesia" },
  { value: "en", label: "English" },
]

const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+7)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (UTC+8)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (UTC+9)" },
  { value: "UTC", label: "UTC (UTC+0)" },
]

export function SettingsClient() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  // Tab Profil
  const [name, setName] = useState("")
  const [saved, setSaved] = useState(false)
  const [twoFaEnabled, setTwoFaEnabled] = useState(true)

  // Tab API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Tab Integrasi
  const [gitlabNotice, setGitlabNotice] = useState(false)

  // Tab Preferensi — notifikasi granular
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(INITIAL_NOTIF_PREFS)
  const [prefsSaved, setPrefsSaved] = useState(false)

  // Tab Preferensi — bahasa & zona waktu
  const [language, setLanguage] = useState("id")
  const [timezone, setTimezone] = useState("Asia/Jakarta")
  const [localeSaved, setLocaleSaved] = useState(false)

  // Tab Profil — sesi aktif
  const [sessionsNotice, setSessionsNotice] = useState(false)

  if (!user) return null

  const isViewer = user.role === "VIEWER"
  const roleMeta = ROLE_META[user.role]

  const handleSave = () => {
    // Mock save — di backend nyata ini PATCH /api/user
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setName("")
    setTwoFaEnabled(true)
  }

  const handleChangePassword = () => {
    // Mock change password — di backend nyata ini POST /api/user/password
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopy = async (apiKey: ApiKeyItem) => {
    try {
      await navigator.clipboard.writeText(apiKey.fullKey)
    } catch {
      // Fallback untuk browser tanpa clipboard API / konteks non-secure
      const textarea = document.createElement("textarea")
      textarea.value = apiKey.fullKey
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    setCopiedId(apiKey.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleRevoke = (id: string) => {
    // Mock revoke — di backend nyata ini DELETE /api/api-keys/:id
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const handleGenerate = () => {
    // Mock generate — di backend nyata ini POST /api/api-keys
    setApiKeys((prev) => [...prev, generateMockKey()])
  }

  const handleConnectGitLab = () => {
    // Mock connect — di backend nyata ini redirect ke OAuth GitLab
    setGitlabNotice(true)
    setTimeout(() => setGitlabNotice(false), 2500)
  }

  const handleToggleNotif = (key: keyof NotifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSavePreferences = () => {
    // Mock save — di backend nyata ini PATCH /api/user/preferences
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  const handleSaveLocale = () => {
    // Mock save — di backend nyata ini PATCH /api/user/locale
    setLocaleSaved(true)
    setTimeout(() => setLocaleSaved(false), 2000)
  }

  const handleRevokeOtherSessions = () => {
    // Mock revoke — di backend nyata ini DELETE /api/auth/sessions/others
    setSessionsNotice(true)
    setTimeout(() => setSessionsNotice(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Kelola profil dan preferensi akun Anda.
        </p>
      </div>

      <Tabs defaultValue="profil">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrasi">Integrasi</TabsTrigger>
          <TabsTrigger value="preferensi">Preferensi</TabsTrigger>
        </TabsList>

        {/* ===================== TAB: PROFIL ===================== */}
        <TabsContent value="profil" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Profil</CardTitle>
                <CardDescription>Informasi akun Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <Badge variant="outline" className="mt-1 gap-1.5 text-xs">
                      <ShieldCheck className="h-3 w-3" />
                      Role: {user.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="settings-name">Nama Lengkap</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={user.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" value={user.email} readOnly disabled />
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah pada mode demo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-role">Role</Label>
                  <div
                    className={cn(
                      "flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
                      roleMeta.bgColor,
                      roleMeta.color
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {user.role} ({roleMeta.label})
                    <span className="ml-2 text-xs text-muted-foreground">
                      Read-only
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Role hanya dapat diubah oleh Administrator.
                  </p>
                </div>

                <Separator />

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="settings-password-current">Ganti Password</Label>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      id="settings-password-current"
                      type="password"
                      placeholder="Password saat ini"
                      className="max-w-48"
                    />
                    <Input
                      id="settings-password-new"
                      type="password"
                      placeholder="Password baru"
                      className="max-w-48"
                    />
                    <Button variant="outline" onClick={handleChangePassword}>
                      Ganti Password
                    </Button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="settings-2fa"
                    checked={twoFaEnabled}
                    onCheckedChange={(checked) => setTwoFaEnabled(Boolean(checked))}
                  />
                  <Label htmlFor="settings-2fa" className="font-normal">
                    Two-Factor Authentication (2FA){" "}
                    <span
                      className={cn(
                        "ml-1 text-xs font-medium",
                        twoFaEnabled ? "text-green-500" : "text-muted-foreground"
                      )}
                    >
                      {twoFaEnabled ? "· Aktif" : "· Nonaktif"}
                    </span>
                  </Label>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Simpan Perubahan</Button>
                  {saved && (
                    <span className="flex items-center gap-1 text-sm text-green-500">
                      <BadgeCheck className="h-4 w-4" />
                      Tersimpan
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hak akses + sesi */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hak Akses Anda</CardTitle>
                  <CardDescription>Ringkasan role {user.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {PERMISSION_SUMMARY[user.role].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                    Sesi Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="space-y-2">
                    {MOCK_SESSIONS.map((session) => (
                      <li
                        key={session.id}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {session.device}
                          <span
                            className={cn(
                              "ml-1 text-xs",
                              session.current && "text-green-500"
                            )}
                          >
                            · {session.detail}
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
                    onClick={handleRevokeOtherSessions}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cabut Semua Sesi Lain
                    {isViewer && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Read-only
                      </span>
                    )}
                  </Button>
                  {sessionsNotice && (
                    <p className="flex items-center gap-1 text-green-500">
                      <BadgeCheck className="h-4 w-4" />
                      Mock: semua sesi lain telah dicabut.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Danger zone */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
                  <CardDescription>
                    Aksi permanen yang tidak dapat dibatalkan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full" disabled>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Akun
                    <span className="ml-auto text-xs opacity-70">Segera</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===================== TAB: API KEYS ===================== */}
        <TabsContent value="api-keys" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Gunakan API key untuk autentikasi CLI & CI/CD.
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleGenerate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Generate New Key
              </Button>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada API key. Klik &quot;Generate New Key&quot; untuk membuat.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {apiKeys.map((apiKey) => (
                    <li
                      key={apiKey.id}
                      className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-40 flex-1">
                        <p className="text-sm font-medium">{apiKey.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {maskKey(apiKey.fullKey)} · dibuat {apiKey.createdAt}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(apiKey)}
                      >
                        {copiedId === apiKey.id ? (
                          <>
                            <Check className="mr-1.5 h-4 w-4 text-green-500" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(apiKey.id)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB: INTEGRASI ===================== */}
        <TabsContent value="integrasi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrasi Git</CardTitle>
              <CardDescription>
                Hubungkan akun Git Anda untuk import repositori & deploy otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GitHub — terhubung */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center gap-3">
                  <SiGithub className="h-6 w-6" />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      GitHub
                      <span className="flex items-center gap-1 text-xs font-normal text-green-500">
                        <span className="size-2 rounded-full bg-green-500" />
                        Terhubung (dev-user)
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Import repo & webhook aktif.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={isViewer}>
                  Kelola Repos
                  {isViewer && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Read-only
                    </span>
                  )}
                </Button>
              </div>

              {/* GitLab — belum terhubung */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <SiGitlab className="h-6 w-6 text-orange-500" />
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
                  onClick={handleConnectGitLab}
                  disabled={isViewer}
                >
                  Connect
                </Button>
              </div>
              {gitlabNotice && (
                <p className="flex items-center gap-1 text-sm text-green-500">
                  <BadgeCheck className="h-4 w-4" />
                  Mock: OAuth GitLab akan dibuka di mode produksi.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB: PREFERENSI ===================== */}
        <TabsContent value="preferensi" className="mt-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Sesuaikan tampilan OmniStack dengan preferensi Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(["light", "dark", "system"] as const).map((option) => (
                    <Button
                      key={option}
                      variant={theme === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(option)}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifikasi</CardTitle>
                <CardDescription>
                  Atur bagaimana OmniStack mengabari Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {NOTIF_OPTION_GROUPS.map((group) => (
                  <div key={group.group} className="space-y-2">
                    <p className="text-sm font-medium">{group.group}</p>
                    {group.options.map((option) => (
                      <div
                        key={option.key}
                        className="flex items-center gap-3"
                      >
                        <Checkbox
                          id={`settings-notif-${option.key}`}
                          checked={notifPrefs[option.key]}
                          onCheckedChange={() => handleToggleNotif(option.key)}
                        />
                        <Label
                          htmlFor={`settings-notif-${option.key}`}
                          className="font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <Button size="sm" onClick={handleSavePreferences}>
                    Simpan Preferences
                  </Button>
                  {prefsSaved && (
                    <span className="flex items-center gap-1 text-sm text-green-500">
                      <BadgeCheck className="h-4 w-4" />
                      Tersimpan
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bahasa &amp; Zona Waktu</CardTitle>
                <CardDescription>
                  Lokalisasi tampilan dashboard (mock, belum terhubung backend).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-language">Bahasa</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(String(value))}
                  >
                    <SelectTrigger id="settings-language" className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-timezone">Zona Waktu</Label>
                  <Select
                    value={timezone}
                    onValueChange={(value) => setTimezone(String(value))}
                  >
                    <SelectTrigger id="settings-timezone" className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button size="sm" onClick={handleSaveLocale}>
                    Simpan Bahasa &amp; Zona Waktu
                  </Button>
                  {localeSaved && (
                    <span className="flex items-center gap-1 text-sm text-green-500">
                      <BadgeCheck className="h-4 w-4" />
                      Tersimpan
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
