"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Crown,
  FileText,
  FolderGit2,
  GitPullRequest,
  Server,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { MOCK_PROJECTS, MOCK_USERS, getTotalDeployments } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const RECENT_ACTIVITIES = [
  {
    icon: UserPlus,
    color: "text-blue-500",
    text: "User baru registrasi: viewer@omnistack.dev",
    time: "10 menit lalu",
  },
  {
    icon: GitPullRequest,
    color: "text-green-500",
    text: "Deploy sukses: AI Chatbot (deployment ke-12)",
    time: "1 jam lalu",
  },
  {
    icon: Crown,
    color: "text-amber-500",
    text: "Role ditetapkan: dev@omnistack.dev sebagai USER",
    time: "3 jam lalu",
  },
  {
    icon: Server,
    color: "text-purple-500",
    text: "Node cluster selesai scaling (4 → 6 replica)",
    time: "5 jam lalu",
  },
  {
    icon: Activity,
    color: "text-muted-foreground",
    text: "Backup otomatis database produksi berhasil",
    time: "8 jam lalu",
  },
]

const SERVICES = [
  { name: "API Server", uptime: 99.99 },
  { name: "Database", uptime: 99.95 },
  { name: "Storage", uptime: 97.2 },
  { name: "Worker Queue", uptime: 99.8 },
]

const ALERTS = [
  {
    severity: "high" as const,
    label: "High",
    message: "3 deploy failures dalam 24 jam terakhir",
  },
  {
    severity: "medium" as const,
    label: "Medium",
    message: "Storage usage mencapai 85%",
  },
  {
    severity: "low" as const,
    label: "Low",
    message: "2 users belum mengaktifkan 2FA",
  },
]

export function AdminOverview() {
  const { user } = useAuth()
  if (!user) return null

  const totalDeployments = getTotalDeployments(MOCK_PROJECTS)

  const roleCounts = MOCK_USERS.reduce(
    (acc, u) => {
      acc[u.role]++
      return acc
    },
    { ADMIN: 0, USER: 0, VIEWER: 0 }
  )
  const totalUsers = MOCK_USERS.length
  const rolePercents = {
    ADMIN: Math.round((roleCounts.ADMIN / totalUsers) * 100),
    USER: Math.round((roleCounts.USER / totalUsers) * 100),
    VIEWER: Math.round((roleCounts.VIEWER / totalUsers) * 100),
  }

  const stats = [
    { title: "Total User", value: String(MOCK_USERS.length), note: "3 akun demo aktif", icon: Users },
    { title: "Total Proyek", value: String(MOCK_PROJECTS.length), note: "Milik seluruh user", icon: FolderGit2 },
    { title: "Total Deployment", value: String(totalDeployments), note: "+12 minggu ini", icon: Activity },
    { title: "System Health", value: "99.9%", note: "Uptime bulan ini", icon: ShieldCheck },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Crown className="h-7 w-7 text-amber-500" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ringkasan sistem, user, dan aktivitas terbaru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <FileText className="h-4 w-4" />
            Audit
          </Link>
          <Link
            href="/admin/settings"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
            <Settings className="mr-2 h-4 w-4" />
            Kelola User
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Aktivitas terakhir */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>Event sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {RECENT_ACTIVITIES.map((activity) => (
                <div
                  key={activity.text}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <activity.icon className={cn("h-4 w-4", activity.color)} />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm">{activity.text}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/audit"
              className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
            >
              Lihat Semua →
            </Link>
          </CardContent>
        </Card>

        {/* Sidebar cards */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Role</CardTitle>
              <CardDescription>Persentase role seluruh user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${rolePercents.USER}%` }}
                />
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${rolePercents.VIEWER}%` }}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${rolePercents.ADMIN}%` }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="text-sm">USER</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.USER} ({rolePercents.USER}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm">VIEWER</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.VIEWER} ({rolePercents.VIEWER}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm">ADMIN</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.ADMIN} ({rolePercents.ADMIN}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Status layanan aktif</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SERVICES.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{svc.name}</span>
                  </div>
                  <span className="text-sm font-medium text-green-500">{svc.uptime}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alerts & Warnings */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Warnings</CardTitle>
              <CardDescription>Peringatan aktif dari sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALERTS.map((alert) => (
                <div key={alert.message} className="flex items-start gap-3">
                  {alert.severity === "high" && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  {alert.severity === "medium" && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  {alert.severity === "low" && (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  )}
                  <div className="min-w-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "mb-1 text-[10px]",
                        alert.severity === "high" && "border-red-500/40 text-red-500",
                        alert.severity === "medium" && "border-amber-500/40 text-amber-500",
                        alert.severity === "low" && "border-blue-500/40 text-blue-500"
                      )}
                    >
                      {alert.label}
                    </Badge>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
