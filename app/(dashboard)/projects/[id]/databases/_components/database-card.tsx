"use client"

import Link from "next/link"
import {
  BarChart3,
  HardDriveDownload,
  History,
  KeyRound,
  Link as LinkIcon,
  MoreVertical,
  Plug,
  Settings,
  Terminal,
  Trash2,
} from "lucide-react"
import {
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiRedis,
} from "react-icons/si"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DB_PLANS,
  ENGINE_META,
  roleAtLeast,
  type DatabaseStatus,
  type MockDatabase,
  type Role,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const STATUS_META: Record<
  DatabaseStatus,
  { label: string; dot: string; pulse?: boolean }
> = {
  HEALTHY: { label: "Sehat", dot: "#22c55e" },
  BACKUPING: { label: "Mem-backup", dot: "#eab308", pulse: true },
  ERROR: { label: "Error", dot: "#ef4444" },
  MAINTENANCE: { label: "Pemeliharaan", dot: "#3b82f6" },
}

function resourceFillClass(percent: number): string {
  if (percent < 60) return "bg-green-500"
  if (percent < 80) return "bg-yellow-500"
  return "bg-red-500"
}

function ResourceRow({
  label,
  value,
  percent,
}: {
  label: string
  value: string
  percent: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            resourceFillClass(percent),
          )}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  )
}

const ENGINE_ICONS = {
  POSTGRES: SiPostgresql,
  MYSQL: SiMysql,
  REDIS: SiRedis,
  MONGODB: SiMongodb,
} as const

interface DatabaseCardProps {
  database: MockDatabase
  role: Role
  onConnect: (db: MockDatabase) => void
  onDelete: (db: MockDatabase) => void
  onRotate: (db: MockDatabase) => void
}

export function DatabaseCard({
  database,
  role,
  onConnect,
  onDelete,
  onRotate,
}: DatabaseCardProps) {
  const meta = ENGINE_META[database.engine]
  const EngineIcon = ENGINE_ICONS[database.engine]
  const statusMeta = STATUS_META[database.status]
  const plan = DB_PLANS.find((p) => p.value === database.plan)
  const canManage = roleAtLeast(role, "USER")
  const baseHref = `/projects/${database.projectId}/databases/${database.id}`

  return (
    <div className="rounded-xl border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl"
          style={{
            backgroundColor: `${meta.color}1a`,
            color: meta.color,
          }}
        >
          <EngineIcon />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{database.name}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {meta.label} {database.version}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {database.createdAtLabel}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Menu aksi database"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onConnect(database)}>
                <LinkIcon />
                Info Koneksi
              </DropdownMenuItem>
              {canManage ? (
                <DropdownMenuItem render={<Link href={`${baseHref}/console`} />}>
                  <Terminal />
                  Buka Query Console
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem render={<Link href={`${baseHref}/metrics`} />}>
                <BarChart3 />
                Lihat Metrik
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={`${baseHref}/backups`} />}>
                <History />
                Riwayat Backup
              </DropdownMenuItem>
              {canManage ? (
                <DropdownMenuItem onClick={() => onRotate(database)}>
                  <KeyRound />
                  Rotate Password
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {canManage ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(database)}
              >
                <Trash2 />
                Hapus Database
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            statusMeta.pulse && "animate-pulse",
          )}
          style={{ backgroundColor: statusMeta.dot }}
        />
        <span className="text-xs font-medium">{statusMeta.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Uptime: {database.metrics.uptime}%
        </span>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3">
        <ResourceRow
          label="Penyimpanan"
          value={`${database.resources.storageUsedGb}/${database.resources.storageLimitGb} GB`}
          percent={
            (database.resources.storageUsedGb /
              database.resources.storageLimitGb) *
            100
          }
        />
        <ResourceRow
          label="CPU"
          value={`${database.resources.cpuUsage}%`}
          percent={database.resources.cpuUsage}
        />
        <ResourceRow
          label="RAM"
          value={`${database.resources.ramUsage}%`}
          percent={database.resources.ramUsage}
        />
        <ResourceRow
          label="Koneksi"
          value={`${database.resources.connectionsCurrent}/${database.resources.connectionsMax}`}
          percent={
            (database.resources.connectionsCurrent /
              database.resources.connectionsMax) *
            100
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm">
          Paket: {plan?.label ?? database.plan} ({plan?.priceLabel})
        </p>
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          aria-label={`Connect ke ${database.name}`}
          onClick={() => onConnect(database)}
        >
          <Plug className="mr-1 h-4 w-4" />
          Connect
        </Button>
        <Link
          href={`${baseHref}/metrics`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full",
          )}
          aria-label={`Metrik ${database.name}`}
        >
          <BarChart3 className="mr-1 h-4 w-4" />
          Metrik
        </Link>
        <Link
          href={`${baseHref}/backups`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full",
          )}
          aria-label={`Backup ${database.name}`}
        >
          <HardDriveDownload className="mr-1 h-4 w-4" />
          Backup
        </Link>
        <Button variant="outline" size="sm" className="w-full" disabled>
          <Settings className="mr-1 h-4 w-4" />
          Pengaturan
        </Button>
      </div>
    </div>
  )
}
