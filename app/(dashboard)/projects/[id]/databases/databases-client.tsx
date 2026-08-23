"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, FolderGit2, Plus } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DB_PLANS,
  MOCK_PROJECTS,
  getMockDatabasesForRole,
  roleAtLeast,
  type DatabaseEngine,
  type DatabasePlan,
  type DatabaseStatus,
  type MockDatabase,
  type Role,
} from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { DatabaseStats } from "./_components/database-stats"
import { DatabaseCard } from "./_components/database-card"
import { DatabaseFilters } from "./_components/database-filters"
import { DatabasesEmptyState } from "./_components/empty-state"
import { CreateDatabaseDialog } from "./_components/create-database-dialog"
import { ConnectionDialog } from "./_components/connection-dialog"
import { DeleteDatabaseDialog } from "./_components/delete-database-dialog"
import { RotatePasswordDialog } from "./_components/rotate-password-dialog"

interface DatabasesClientProps {
  projectId: string
}

export function DatabasesClient({ projectId }: DatabasesClientProps) {
  const { user } = useAuth()
  const role: Role = user?.role ?? "VIEWER"

  const [extraDatabases, setExtraDatabases] = useState<MockDatabase[]>([])
  const [search, setSearch] = useState("")
  const [engineFilter, setEngineFilter] = useState<DatabaseEngine | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<DatabaseStatus | "ALL">("ALL")
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [connectTarget, setConnectTarget] = useState<MockDatabase | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MockDatabase | null>(null)
  const [rotateTarget, setRotateTarget] = useState<MockDatabase | null>(null)

  const project = MOCK_PROJECTS.find((p) => p.id === projectId)
  const canWrite = roleAtLeast(role, "USER")

  const databases = useMemo(() => {
    const base =
      user && project
        ? getMockDatabasesForRole(user.id, role).filter(
            (d) => d.projectId === projectId
          )
        : []
    return [...base, ...extraDatabases]
  }, [user, role, projectId, project, extraDatabases])

  const filtered = useMemo(() => {
    return databases.filter((d) => {
      const matchSearch = search
        ? d.name.toLowerCase().includes(search.toLowerCase())
        : true
      const matchEngine = engineFilter === "ALL" || d.engine === engineFilter
      const matchStatus = statusFilter === "ALL" || d.status === statusFilter
      return matchSearch && matchEngine && matchStatus
    })
  }, [databases, search, engineFilter, statusFilter])

  if (!project || !user) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Proyek
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderGit2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">
              {project ? "Memuat sesi..." : "Proyek tidak ditemukan"}
            </p>
            {!project && (
              <p className="mt-1 text-sm text-muted-foreground">
                ID proyek &quot;{projectId}&quot; tidak valid atau sudah dihapus.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 3000)
  }

  const handleCreate = (input: {
    name: string
    engine: DatabaseEngine
    version: string
    plan: DatabasePlan
  }) => {
    const planMeta = DB_PLANS.find((p) => p.value === input.plan)
    const newDb: MockDatabase = {
      id: `db-${input.name}-${Date.now()}`,
      name: input.name,
      engine: input.engine,
      version: input.version,
      status: "HEALTHY",
      projectId,
      ownerId: user.id,
      region: "ap-southeast-1",
      plan: input.plan,
      createdAtLabel: "baru saja",
      connection: {
        host: `${input.name.replace(/_/g, "-")}.db.omnistack.dev`,
        port: input.engine === "REDIS" ? 6379 : input.engine === "MYSQL" ? 3306 : input.engine === "MONGODB" ? 27017 : 5432,
        database: input.name,
        username: `${input.name.split("_")[0]}_user`,
        password: `mock-${Math.random().toString(36).slice(2, 12)}`,
        uri: `${input.engine === "REDIS" ? "rediss" : input.engine === "MYSQL" ? "mysql" : input.engine === "MONGODB" ? "mongodb+srv" : "postgresql"}://user:••••••••@${input.name}.db.omnistack.dev`,
        sslMode: "require",
      },
      resources: {
        storageUsedGb: 0.1,
        storageLimitGb: planMeta?.storageGb ?? 5,
        cpuUsage: 4,
        ramUsage: 8,
        connectionsCurrent: 1,
        connectionsMax: 100,
      },
      metrics: { queriesPerSecond: 0, avgResponseTimeMs: 5, uptime: 100 },
      pitrEnabled: input.engine !== "REDIS",
    }
    setExtraDatabases((prev) => [...prev, newDb])
    showNotice("success", `Database "${newDb.name}" berhasil dibuat (mock).`)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setExtraDatabases((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      showNotice("success", `Database "${deleteTarget.name}" dihapus permanen (mock).`)
    }
    setDeleteTarget(null)
  }

  const handleRotateConfirm = () => {
    if (rotateTarget) {
      showNotice("success", `Password untuk "${rotateTarget.name}" dirotasi (mock).`)
    }
    setRotateTarget(null)
  }

  const hasFilters = Boolean(search) || engineFilter !== "ALL" || statusFilter !== "ALL"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-2 w-fit gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            {project.name}
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Database className="h-7 w-7 text-primary" />
            Databases
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola PostgreSQL, Redis &amp; lainnya untuk proyek ini.
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Database
          </Button>
        )}
      </div>

      {/* Notifikasi */}
      {notice && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          )}
        >
          {notice.text}
        </div>
      )}

      {/* Stats */}
      <DatabaseStats databases={databases} />

      {/* Filters */}
      <DatabaseFilters
        search={search}
        onSearchChange={setSearch}
        engine={engineFilter}
        onEngineChange={setEngineFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <DatabasesEmptyState
          hasFilters={hasFilters}
          onCreate={canWrite ? () => setCreateOpen(true) : undefined}
          onClearFilters={
            hasFilters
              ? () => {
                  setSearch("")
                  setEngineFilter("ALL")
                  setStatusFilter("ALL")
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((db) => (
            <DatabaseCard
              key={db.id}
              database={db}
              role={role}
              onConnect={setConnectTarget}
              onDelete={setDeleteTarget}
              onRotate={setRotateTarget}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateDatabaseDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
      <ConnectionDialog
        database={connectTarget}
        open={connectTarget !== null}
        onOpenChange={(open) => !open && setConnectTarget(null)}
      />
      <DeleteDatabaseDialog
        database={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
      <RotatePasswordDialog
        database={rotateTarget}
        open={rotateTarget !== null}
        onOpenChange={(open) => !open && setRotateTarget(null)}
        onConfirm={handleRotateConfirm}
      />
    </div>
  )
}
