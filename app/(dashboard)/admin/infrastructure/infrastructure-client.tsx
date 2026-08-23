"use client"

import { useState } from "react"
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  Database,
  HardDrive,
  Plus,
  Power,
  RefreshCw,
  Server,
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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type NodeStatus = "active" | "maintenance" | "draining"

interface VPSNode {
  id: string
  name: string
  region: string
  status: NodeStatus
  cpu: number
  ram: number
  disk: number
}

const INITIAL_NODES: VPSNode[] = [
  { id: "n1", name: "node-sgp-01", region: "Singapore", status: "active", cpu: 42, ram: 61, disk: 55 },
  { id: "n2", name: "node-jkt-02", region: "Jakarta", status: "active", cpu: 78, ram: 84, disk: 72 },
  { id: "n3", name: "node-fra-03", region: "Frankfurt", status: "maintenance", cpu: 12, ram: 28, disk: 41 },
  { id: "n4", name: "node-sfo-04", region: "San Francisco", status: "active", cpu: 56, ram: 67, disk: 63 },
]

const NODE_STATUS_META: Record<NodeStatus, { label: string; dotClass: string; badgeClass: string }> = {
  active: { label: "Active", dotClass: "bg-green-500", badgeClass: "text-green-500 border-green-500/40 bg-green-500/10" },
  maintenance: { label: "Maintenance", dotClass: "bg-yellow-500", badgeClass: "text-yellow-500 border-yellow-500/40 bg-yellow-500/10" },
  draining: { label: "Draining", dotClass: "bg-red-500", badgeClass: "text-red-500 border-red-500/40 bg-red-500/10" },
}

interface Cluster {
  id: string
  name: string
  nodeCount: number
  status: "healthy" | "degraded"
  uptime: string
}

const INITIAL_CLUSTERS: Cluster[] = [
  { id: "c1", name: "production", nodeCount: 3, status: "healthy", uptime: "99.95% (30d)" },
  { id: "c2", name: "staging", nodeCount: 1, status: "healthy", uptime: "99.80% (30d)" },
]

interface AutoScaleRule {
  id: string
  metric: string
  condition: string
  threshold: number
  action: string
  enabled: boolean
}

const INITIAL_RULES: AutoScaleRule[] = [
  { id: "r1", metric: "CPU Usage", condition: ">", threshold: 80, action: "Tambah node", enabled: true },
  { id: "r2", metric: "RAM Usage", condition: ">", threshold: 90, action: "Kirim alert", enabled: true },
  { id: "r3", metric: "Disk Usage", condition: ">", threshold: 85, action: "Tambah node", enabled: false },
]

interface Service {
  id: string
  name: string
  status: "healthy" | "unhealthy"
  replicas: string
  port: number
}

const SERVICES: Service[] = [
  { id: "s1", name: "api-gateway", status: "healthy", replicas: "3/3", port: 8080 },
  { id: "s2", name: "auth-service", status: "healthy", replicas: "2/2", port: 8081 },
  { id: "s3", name: "billing-worker", status: "unhealthy", replicas: "1/2", port: 8082 },
  { id: "s4", name: "notification-service", status: "healthy", replicas: "2/2", port: 8083 },
]

interface Database {
  id: string
  name: string
  type: string
  status: "running" | "stopped"
  size: string
  connections: number
}

const INITIAL_DBS: Database[] = [
  { id: "d1", name: "postgres-main", type: "PostgreSQL 16", status: "running", size: "12.4 GB", connections: 48 },
  { id: "d2", name: "redis-cache", type: "Redis 7", status: "running", size: "2.1 GB", connections: 128 },
  { id: "d3", name: "mongodb-analytics", type: "MongoDB 7", status: "running", size: "34.7 GB", connections: 22 },
]

function UsageBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          value > 80 ? "bg-destructive" : value > 60 ? "bg-yellow-500" : "bg-primary",
          className
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function InfrastructureClient() {
  const [nodes, setNodes] = useState<VPSNode[]>(INITIAL_NODES)
  const [clusters, setClusters] = useState<Cluster[]>(INITIAL_CLUSTERS)
  const [rules, setRules] = useState<AutoScaleRule[]>(INITIAL_RULES)
  const [dbs, setDbs] = useState<Database[]>(INITIAL_DBS)

  const [addNodeOpen, setAddNodeOpen] = useState(false)
  const [newNodeName, setNewNodeName] = useState("")
  const [newNodeRegion, setNewNodeRegion] = useState("")

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [confirmDeleteDbId, setConfirmDeleteDbId] = useState<string | null>(null)
  const [provisionDbOpen, setProvisionDbOpen] = useState(false)
  const [newDbName, setNewDbName] = useState("")
  const [newDbType, setNewDbType] = useState("PostgreSQL 16")
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null)
  const [thresholdInput, setThresholdInput] = useState("")

  const handleAddNode = () => {
    const name = newNodeName.trim()
    const region = newNodeRegion.trim()
    if (!name || !region) return
    setNodes((prev) => [
      ...prev,
      { id: `n-${Date.now()}`, name, region, status: "active", cpu: 0, ram: 0, disk: 0 },
    ])
    setClusters((prev) => prev.map((c) => c.name === "production" ? { ...c, nodeCount: c.nodeCount + 1 } : c))
    setNewNodeName("")
    setNewNodeRegion("")
    setAddNodeOpen(false)
  }

  const handleRemoveNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setClusters((prev) => prev.map((c) => c.name === "production" ? { ...c, nodeCount: Math.max(0, c.nodeCount - 1) } : c))
    setConfirmRemoveId(null)
  }

  const handleDrainNode = (id: string) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, status: "draining" as NodeStatus } : n))
  }

  const handleRebootNode = (id: string) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, status: "maintenance" as NodeStatus } : n))
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => n.id === id ? { ...n, status: "active" as NodeStatus } : n))
    }, 2000)
  }

  const handleToggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const handleSaveThreshold = (id: string) => {
    const val = parseInt(thresholdInput, 10)
    if (isNaN(val) || val < 1 || val > 100) return
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, threshold: val } : r))
    setEditingThresholdId(null)
    setThresholdInput("")
  }

  const handleProvisionDb = () => {
    const name = newDbName.trim()
    if (!name) return
    setDbs((prev) => [
      ...prev,
      { id: `d-${Date.now()}`, name, type: newDbType, status: "running", size: "0 GB", connections: 0 },
    ])
    setNewDbName("")
    setNewDbType("PostgreSQL 16")
    setProvisionDbOpen(false)
  }

  const handleDeleteDb = (id: string) => {
    setDbs((prev) => prev.filter((d) => d.id !== id))
    setConfirmDeleteDbId(null)
  }

  const handleRestartDb = (id: string) => {
    setDbs((prev) => prev.map((d) => d.id === id ? { ...d, status: "stopped" as const } : d))
    setTimeout(() => {
      setDbs((prev) => prev.map((d) => d.id === id ? { ...d, status: "running" as const } : d))
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Server className="h-7 w-7 text-primary" />
            Infrastructure Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola VPS nodes, cluster, auto-scaling, service discovery, dan provisioning database.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {nodes.filter((n) => n.status === "active").length} aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clusters</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clusters.length}</div>
            <p className="text-xs text-muted-foreground">Semua sehat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SERVICES.length}</div>
            <p className="text-xs text-muted-foreground">
              {SERVICES.filter((s) => s.status === "healthy").length}/{SERVICES.length} healthy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbs.length}</div>
            <p className="text-xs text-muted-foreground">
              {dbs.filter((d) => d.status === "running").length} berjalan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                VPS Nodes
              </CardTitle>
              <CardDescription>Daftar node dalam cluster dan status kesehatannya</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddNodeOpen(true)}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Tambah Node
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {nodes.map((node) => {
              const meta = NODE_STATUS_META[node.status]
              const isRemoving = confirmRemoveId === node.id
              return (
                <div key={node.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", meta.dotClass)} />
                      <div>
                        <p className="font-mono text-sm font-medium">{node.name}</p>
                        <p className="text-xs text-muted-foreground">{node.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("gap-1.5", meta.badgeClass)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full bg-current", node.status === "maintenance" && "animate-pulse")} />
                        {meta.label}
                      </Badge>
                      {isRemoving ? (
                        <>
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveNode(node.id)}>
                            Ya, Hapus
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmRemoveId(null)}>
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Drain node"
                            onClick={() => handleDrainNode(node.id)}
                            disabled={node.status === "draining"}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Reboot node"
                            onClick={() => handleRebootNode(node.id)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Hapus node"
                            onClick={() => setConfirmRemoveId(node.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">CPU</span>
                        <span className="font-mono">{node.cpu}%</span>
                      </div>
                      <UsageBar value={node.cpu} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">RAM</span>
                        <span className="font-mono">{node.ram}%</span>
                      </div>
                      <UsageBar value={node.ram} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Disk</span>
                        <span className="font-mono">{node.disk}%</span>
                      </div>
                      <UsageBar value={node.disk} />
                    </div>
                  </div>
                </div>
              )
            })}
            {nodes.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada node. Tambahkan node pertama.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Cluster Management
              </CardTitle>
              <CardDescription>Overview cluster dan jumlah node</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{cluster.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cluster.nodeCount} node · Uptime {cluster.uptime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1.5",
                        cluster.status === "healthy"
                          ? "text-green-500 border-green-500/40 bg-green-500/10"
                          : "text-yellow-500 border-yellow-500/40 bg-yellow-500/10"
                      )}
                    >
                      {cluster.status === "healthy" ? "Sehat" : "Degraded"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Scale up"
                      onClick={() =>
                        setClusters((prev) =>
                          prev.map((c) => c.id === cluster.id ? { ...c, nodeCount: c.nodeCount + 1 } : c)
                        )
                      }
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Scale down"
                      disabled={cluster.nodeCount <= 1}
                      onClick={() =>
                        setClusters((prev) =>
                          prev.map((c) => c.id === cluster.id ? { ...c, nodeCount: Math.max(1, c.nodeCount - 1) } : c)
                        )
                      }
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Auto-Scaling Rules
              </CardTitle>
              <CardDescription>Aturan otomatis untuk scaling dan alerting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                      aria-label={`Toggle rule ${rule.metric}`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {rule.metric} {rule.condition}{" "}
                        {editingThresholdId === rule.id ? (
                          <span className="inline-flex items-center gap-1">
                            <Input
                              type="number"
                              value={thresholdInput}
                              onChange={(e) => setThresholdInput(e.target.value)}
                              className="h-6 w-14 inline-block px-1 py-0 text-xs font-mono"
                              min={1}
                              max={100}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveThreshold(rule.id)
                                if (e.key === "Escape") setEditingThresholdId(null)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleSaveThreshold(rule.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </span>
                        ) : (
                          <button
                            className="font-mono text-primary hover:underline"
                            onClick={() => {
                              setEditingThresholdId(rule.id)
                              setThresholdInput(String(rule.threshold))
                            }}
                          >
                            {rule.threshold}%
                          </button>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">→ {rule.action}</p>
                    </div>
                  </div>
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Service Discovery
            </CardTitle>
            <CardDescription>Layanan internal yang terdaftar di service mesh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        service.status === "healthy" ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <div>
                      <p className="font-mono text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Port {service.port} · Replicas {service.replicas}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      service.status === "healthy"
                        ? "text-green-500 border-green-500/40 bg-green-500/10"
                        : "text-red-500 border-red-500/40 bg-red-500/10"
                    )}
                  >
                    {service.status === "healthy" ? "Healthy" : "Unhealthy"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Database Provisioning
              </CardTitle>
              <CardDescription>Kelola database dan provisioning baru</CardDescription>
            </div>
            <Button size="sm" onClick={() => setProvisionDbOpen(true)}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Provision
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dbs.map((db) => {
                const isDeleting = confirmDeleteDbId === db.id
                return (
                  <div key={db.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-medium">{db.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {db.type} · {db.size} · {db.connections} connections
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1.5",
                            db.status === "running"
                              ? "text-green-500 border-green-500/40 bg-green-500/10"
                              : "text-muted-foreground border-border bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full bg-current",
                              db.status === "running" && "animate-pulse"
                            )}
                          />
                          {db.status === "running" ? "Running" : "Stopped"}
                        </Badge>
                        {isDeleting ? (
                          <>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDb(db.id)}>
                              Ya, Hapus
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteDbId(null)}>
                              Batal
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Restart"
                              onClick={() => handleRestartDb(db.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="Hapus"
                              onClick={() => setConfirmDeleteDbId(db.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {dbs.length === 0 && (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada database. Provision database pertama.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={addNodeOpen} onOpenChange={setAddNodeOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tambah VPS Node</SheetTitle>
            <SheetDescription>
              Tambahkan node baru ke cluster production.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="node-name">Nama Node</Label>
              <Input
                id="node-name"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="node-sgp-05"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-region">Region</Label>
              <Input
                id="node-region"
                value={newNodeRegion}
                onChange={(e) => setNewNodeRegion(e.target.value)}
                placeholder="Singapore"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Node akan di-provision otomatis setelah ditambahkan (mock).
            </p>
          </div>
          <SheetFooter>
            <Button onClick={handleAddNode} disabled={!newNodeName.trim() || !newNodeRegion.trim()}>
              Tambah Node
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={provisionDbOpen} onOpenChange={setProvisionDbOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Provision Database Baru</SheetTitle>
            <SheetDescription>
              Buat instance database baru untuk cluster.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="db-name">Nama Database</Label>
              <Input
                id="db-name"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="postgres-analytics"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-type">Tipe</Label>
              <Input
                id="db-type"
                value={newDbType}
                onChange={(e) => setNewDbType(e.target.value)}
                placeholder="PostgreSQL 16"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Database akan di-provision dalam 2-3 menit (mock).
            </p>
          </div>
          <SheetFooter>
            <Button onClick={handleProvisionDb} disabled={!newDbName.trim()}>
              Provision Database
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
