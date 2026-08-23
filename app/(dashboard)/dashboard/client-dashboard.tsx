"use client"

import Link from "next/link"
import {
  Activity,
  Crown,
  Eye,
  FolderGit2,
  Gauge,
  Server,
  ShieldCheck,
  Settings,
  Timer,
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
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { useAuth } from "@/lib/auth-context"
import {
  getMockProjectsByUser,
  getTotalDeployments,
  MOCK_USERS,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const ROLE_META: Record<
  Role,
  {
    icon: typeof Crown
    label: string
    description: string
    color: string
    bgColor: string
    badgeColor: string
    hint: string
  }
> = {
  ADMIN: {
    icon: Crown,
    label: "Administrator",
    description: "Akses penuh ke seluruh sistem",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    badgeColor: "text-amber-500 border-current",
    hint: "Anda memiliki akses penuh. Coba buka User Management untuk mengelola user & role.",
  },
  USER: {
    icon: Gauge,
    label: "Developer",
    description: "Kelola proyek & deployment Anda",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    badgeColor: "text-blue-500 border-current",
    hint: "Anda bisa melihat proyek milik Anda sendiri. Proyek user lain tidak akan tampil di sini.",
  },
  VIEWER: {
    icon: Eye,
    label: "Viewer",
    description: "Akses read-only untuk monitoring",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    badgeColor: "text-emerald-500 border-current",
    hint: "Mode read-only. Semua tombol aksi dinonaktifkan dan Anda hanya melihat data yang di-share.",
  },
}

export function ClientDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const meta = ROLE_META[user.role]
  const RoleIcon = meta.icon

  const projects = getMockProjectsByUser(user.id, user.role)
  const totalDeployments = getTotalDeployments(projects)
  const isAdmin = user.role === "ADMIN"
  const isViewer = user.role === "VIEWER"

  const stats = [
    {
      title: isAdmin ? "Total Proyek" : isViewer ? "Proyek Di-share" : "Proyek Saya",
      value: String(projects.length),
      note: isViewer ? "Menunggu proyek di-share" : "+2 dari bulan lalu",
      icon: FolderGit2,
    },
    {
      title: "Deployments",
      value: String(totalDeployments),
      note: isViewer ? "View only" : "+12 minggu ini",
      icon: Activity,
    },
    ...(isAdmin
      ? [
          {
            title: "Total User",
            value: String(MOCK_USERS.length),
            note: "3 akun demo aktif",
            icon: Server,
          },
          {
            title: "System Health",
            value: "99.9%",
            note: "Uptime bulan ini",
            icon: ShieldCheck,
          },
        ]
      : []),
    ...(!isAdmin && !isViewer
      ? [
          {
            title: "Build Success",
            value: "98.2%",
            note: "30 hari terakhir",
            icon: ShieldCheck,
          },
          {
            title: "Avg Response",
            value: "142ms",
            note: "-8ms dari minggu lalu",
            icon: Timer,
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Selamat datang kembali, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">{meta.description}</p>
        </div>
        <Badge variant="outline" className={cn("gap-1.5", meta.badgeColor)}>
          <RoleIcon className="h-3 w-3" />
          {meta.label}
        </Badge>
      </div>

      {/* ================= STAT CARDS ================= */}
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
        {/* ================= PROJECTS ================= */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              {isAdmin ? "Semua Proyek" : isViewer ? "Proyek yang Di-share" : "Proyek Saya"}
            </CardTitle>
            <CardDescription>
              {isViewer
                ? "Belum ada proyek yang di-share ke Anda."
                : `${projects.length} proyek • ${totalDeployments} total deployment`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Eye className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Data proyek tidak tersedia untuk role Viewer.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {project.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <ProjectStatusBadge status={project.status} />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {project.deployments} deploy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================= AKSI + INFO ================= */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {!isViewer && (
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Penyesuaian per role</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start"
                    )}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Kelola User
                  </Link>
                )}
                <Link
                  href="/ai-architect"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-start"
                  )}
                >
                  <FolderGit2 className="mr-2 h-4 w-4" />
                  Buat Proyek dengan AI
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className={cn("border", meta.bgColor)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    meta.bgColor
                  )}
                >
                  <RoleIcon className={cn("h-6 w-6", meta.color)} />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Testing Role: {meta.label}</h3>
                  <p className="text-sm text-muted-foreground">{meta.hint}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline" className="text-xs">
                      {user.email}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Role: {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
