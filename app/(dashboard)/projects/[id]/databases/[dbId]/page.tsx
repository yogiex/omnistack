import { MOCK_DATABASES, MOCK_PROJECTS } from "@/lib/mock-data"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Database,
  HardDriveDownload,
  TerminalSquare,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DatabaseStatus } from "@/lib/mock-data"

const STATUS_META: Record<
  DatabaseStatus,
  { label: string; color: string; pulse?: boolean }
> = {
  HEALTHY: { label: "Sehat", color: "#22c55e" },
  BACKUPING: { label: "Mem-backup", color: "#eab308", pulse: true },
  ERROR: { label: "Error", color: "#ef4444" },
  MAINTENANCE: { label: "Pemeliharaan", color: "#3b82f6" },
}

function StatusBadge({ status }: { status: DatabaseStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
      <span
        className={cn("h-2 w-2 rounded-full", meta.pulse && "animate-pulse")}
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  )
}

export function generateStaticParams() {
  return MOCK_DATABASES.map((db) => ({ id: db.projectId, dbId: db.id }))
}

const NAV_ITEMS = [
  {
    href: "metrics",
    label: "Metrik",
    description: "QPS, koneksi, response time & slow queries",
    icon: BarChart3,
  },
  {
    href: "backups",
    label: "Backup",
    description: "Backup terjadwal, manual & point-in-time recovery",
    icon: HardDriveDownload,
  },
  {
    href: "console",
    label: "Query Console",
    description: "Jalankan query SQL langsung ke database",
    icon: TerminalSquare,
  },
] as const

export default async function DatabaseDetailPage({
  params,
}: {
  params: Promise<{ id: string; dbId: string }>
}) {
  const { id, dbId } = await params
  const database = MOCK_DATABASES.find((d) => d.id === dbId)
  const project = MOCK_PROJECTS.find((p) => p.id === id)

  if (!database || !project) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href={`/projects/${id}/databases`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Database tidak ditemukan.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/projects/${id}/databases`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
      >
        <ArrowLeft className="h-4 w-4" />
        {project.name} / Databases
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{database.name}</h1>
          <p className="text-sm text-muted-foreground">
            {database.version} · {database.region}
          </p>
        </div>
        <StatusBadge status={database.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={`/projects/${id}/databases/${dbId}/${item.href}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col items-start gap-1.5 p-5 text-left"
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {item.description}
            </span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b pb-2 sm:border-b-0">
            <span className="text-muted-foreground">Engine</span>
            <span className="font-medium">{database.engine}</span>
          </div>
          <div className="flex justify-between border-b pb-2 sm:border-b-0">
            <span className="text-muted-foreground">Paket</span>
            <span className="font-medium">{database.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Host</span>
            <span className="font-mono text-xs">{database.connection.host}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dibuat</span>
            <span className="font-medium">{database.createdAtLabel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
