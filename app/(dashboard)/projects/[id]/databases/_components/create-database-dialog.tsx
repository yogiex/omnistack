"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiRedis,
} from "react-icons/si"
import type { IconType } from "react-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type {
  DatabaseEngine,
  DatabasePlan,
} from "@/lib/mock-data"
import { DB_PLANS, ENGINE_META } from "@/lib/mock-data"

interface CreateDatabaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: {
    name: string
    engine: DatabaseEngine
    version: string
    plan: DatabasePlan
  }) => void
}

const ENGINE_ICONS: Record<DatabaseEngine, IconType> = {
  POSTGRES: SiPostgresql,
  MYSQL: SiMysql,
  REDIS: SiRedis,
  MONGODB: SiMongodb,
}

const NAME_PATTERN = /^[a-z0-9_]+$/

export function CreateDatabaseDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateDatabaseDialogProps) {
  const [name, setName] = useState("")
  const [nameTouched, setNameTouched] = useState(false)
  const [engine, setEngine] = useState<DatabaseEngine>("POSTGRES")
  const [version, setVersion] = useState(
    ENGINE_META.POSTGRES.defaultVersion
  )
  const [plan, setPlan] = useState<DatabasePlan>("STARTER")

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setName("")
      setNameTouched(false)
      setEngine("POSTGRES")
      setVersion(ENGINE_META.POSTGRES.defaultVersion)
      setPlan("STARTER")
    }
  }

  const [prevEngine, setPrevEngine] = useState(engine)
  if (engine !== prevEngine) {
    setPrevEngine(engine)
    setVersion(ENGINE_META[engine].defaultVersion)
  }

  const nameValid = name.length > 0 && NAME_PATTERN.test(name)

  const handleEngineSelect = (selected: DatabaseEngine) => {
    setEngine(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Buat Database Baru
          </DialogTitle>
          <DialogDescription>
            Pilih engine database dan konfigurasi untuk proyek ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="text-sm font-semibold">Langkah 1: Pilih Engine</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(ENGINE_META) as DatabaseEngine[]).map((key) => {
                const meta = ENGINE_META[key]
                const Icon = ENGINE_ICONS[key]
                const selected = engine === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleEngineSelect(key)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                      selected
                        ? "border-2 border-primary bg-primary/5"
                        : "hover:border-border"
                    )}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${meta.color}1a`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium">{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold">Langkah 2: Konfigurasi</h4>

            <div className="space-y-2">
              <Label htmlFor="create-db-name">Nama Database *</Label>
              <Input
                id="create-db-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setNameTouched(true)}
                placeholder="omnistack_analytics"
                autoComplete="off"
              />
              {nameTouched && !nameValid && (
                <p className="text-xs text-destructive">
                  Hanya huruf kecil, angka, dan underscore
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Versi</Label>
              <Select value={version} onValueChange={(v) => setVersion(v ?? "")}>
                <SelectTrigger className="w-full" aria-label="Versi database">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGINE_META[engine].versions.map((v) => (
                    <SelectItem key={v} value={v}>
                      {ENGINE_META[engine].label} {v}
                      {v === ENGINE_META[engine].defaultVersion ? " (LTS)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Select value="ap-southeast-1">
                <SelectTrigger className="w-full" aria-label="Region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ap-southeast-1">
                    Singapore (ap-southeast-1) — Sama dengan proyek
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paket</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DB_PLANS.map((p) => {
                  const selected = plan === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPlan(p.value)}
                      className={cn(
                        "rounded-xl border p-4 text-center transition-colors",
                        selected
                          ? "border-2 border-primary bg-primary/5"
                          : "hover:border-border"
                      )}
                    >
                      <span className="block text-sm font-semibold">
                        {p.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {p.priceLabel}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {p.storageGb >= 1000 ? "Unlimited" : `${p.storageGb} GB`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!nameValid}
            onClick={() => {
              onCreate({ name, engine, version, plan })
              onOpenChange(false)
            }}
          >
            Buat Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
