"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Database, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ENGINE_META,
  MOCK_PROJECTS,
  MOCK_USERS,
  getMockDatabasesForRole,
  type DatabaseEngine,
  type DatabaseStatus,
  type MockDatabase,
} from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const STATUS_META: Record<
  DatabaseStatus,
  { label: string; color: string; pulse?: boolean }
> = {
  HEALTHY: { label: "Sehat", color: "#22c55e" },
  BACKUPING: { label: "Mem-backup", color: "#eab308", pulse: true },
  ERROR: { label: "Error", color: "#ef4444" },
  MAINTENANCE: { label: "Pemeliharaan", color: "#3b82f6" },
}

export function AdminDatabasesClient() {
  const { user } = useAuth()
  const router = useRouter()

  const [projectFilter, setProjectFilter] = useState("ALL")
  const [engineFilter, setEngineFilter] = useState<DatabaseEngine | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<DatabaseStatus | "ALL">("ALL")

  const databases = useMemo(() => {
    if (!user) return []
    return getMockDatabasesForRole(user.id, user.role)
  }, [user])

  const filtered = databases.filter((d) => {
    const matchProject = projectFilter === "ALL" || d.projectId === projectFilter
    const matchEngine = engineFilter === "ALL" || d.engine === engineFilter
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter
    return matchProject && matchEngine && matchStatus
  })

  if (!user) return null

  const totalStorageGb = filtered.reduce(
    (sum, d) => sum + d.resources.storageUsedGb,
    0
  )

  const ownerName = (ownerId: string) =>
    MOCK_USERS.find((u) => u.id === ownerId)?.name ?? ownerId

  const projectName = (projectId: string) =>
    MOCK_PROJECTS.find((p) => p.id === projectId)?.name ?? projectId

  const openDetail = (db: MockDatabase) => {
    router.push(`/projects/${db.projectId}/databases/${db.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Database className="h-7 w-7 text-primary" />
            Semua Database
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola seluruh database lintas proyek di platform.
          </p>
        </div>
        <Button className="gap-2" onClick={() => router.push("/projects")}>
          <Plus className="h-4 w-4" />
          Buat Database
        </Button>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStorageGb.toFixed(1)} GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Butuh Perhatian</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {filtered.filter((d) => d.status !== "HEALTHY").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          aria-label="Filter proyek"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="ALL">Semua Proyek</option>
          {MOCK_PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter tipe engine"
          value={engineFilter}
          onChange={(e) => setEngineFilter(e.target.value as DatabaseEngine | "ALL")}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="ALL">Semua Tipe</option>
          {(Object.keys(ENGINE_META) as DatabaseEngine[]).map((e) => (
            <option key={e} value={e}>
              {ENGINE_META[e].label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DatabaseStatus | "ALL")}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="ALL">Semua Status</option>
          {(Object.keys(STATUS_META) as DatabaseStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Database</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Proyek</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada database yang cocok dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((db) => {
                const status = STATUS_META[db.status]
                return (
                  <TableRow
                    key={db.id}
                    className="cursor-pointer"
                    onClick={() => openDetail(db)}
                  >
                    <TableCell className="font-medium">{db.name}</TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${ENGINE_META[db.engine].color}1a`,
                          color: ENGINE_META[db.engine].color,
                        }}
                      >
                        {ENGINE_META[db.engine].label} {db.version}
                      </span>
                    </TableCell>
                    <TableCell>{projectName(db.projectId)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ownerName(db.ownerId)}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 text-sm")}>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            status.pulse && "animate-pulse"
                          )}
                          style={{ backgroundColor: status.color }}
                        />
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
