"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  HardDriveDownload,
  Loader2,
  Plus,
  RotateCcw,
} from "lucide-react"
import type { MockBackup, MockDatabase } from "@/lib/mock-data"
import { MOCK_BACKUPS } from "@/lib/mock-data"
import type { Role } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface BackupRow {
  backup: MockBackup
  ready: boolean
}

function typeBadge(type: MockBackup["type"]) {
  if (type === "SCHEDULED") {
    return (
      <Badge variant="secondary" className="font-medium">
        Terjadwal
      </Badge>
    )
  }
  if (type === "MANUAL") {
    return <Badge className="font-medium">Manual</Badge>
  }
  return (
    <Badge variant="outline" className="font-medium">
      PITR
    </Badge>
  )
}

export function BackupManager({
  database,
  role,
}: {
  database: MockDatabase
  role: Role
}) {
  const canModify = role !== "VIEWER"
  const counterRef = useRef(0)
  const [pitr, setPitr] = useState(database.pitrEnabled)
  const [backups, setBackups] = useState<BackupRow[]>(() =>
    MOCK_BACKUPS.filter((b) => b.databaseId === database.id).map((backup) => ({
      backup,
      ready: true,
    }))
  )
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [restoreSubtitle, setRestoreSubtitle] = useState<string>("")

  const openRestore = (subtitle: string) => {
    setRestoreSubtitle(subtitle)
    setRestoreOpen(true)
  }

  const handleCreateBackup = () => {
    counterRef.current += 1
    const id = `${database.id}-manual-${counterRef.current}`
    const backup: MockBackup = {
      id,
      databaseId: database.id,
      type: "MANUAL",
      sizeLabel: database.resources.storageUsedGb.toFixed(1) + " GB",
      createdAtLabel: "Baru saja",
      retentionDays: 30,
    }
    setBackups((prev) => [{ backup, ready: false }, ...prev])
    setTimeout(() => {
      setBackups((prev) =>
        prev.map((row) =>
          row.backup.id === id ? { ...row, ready: true } : row
        )
      )
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HardDriveDownload className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          Backup &amp; Point-in-Time Recovery
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kebijakan Backup</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="frekuensi">Frekuensi</Label>
            <Select defaultValue="harian" disabled={!canModify}>
              <SelectTrigger id="frekuensi" aria-label="Frekuensi backup">
                <SelectValue placeholder="Pilih frekuensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="mingguan">Mingguan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retensi">Retensi</Label>
            <Select defaultValue="30" disabled={!canModify}>
              <SelectTrigger id="retensi" aria-label="Retensi backup">
                <SelectValue placeholder="Pilih retensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 hari</SelectItem>
                <SelectItem value="30">30 hari</SelectItem>
                <SelectItem value="90">90 hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waktu">Waktu</Label>
            <Input
              id="waktu"
              defaultValue="02:00 UTC"
              disabled={!canModify}
            />
          </div>
          <div className="flex items-start gap-3 sm:col-span-2 sm:col-start-1">
            <Checkbox
              id="pitr-toggle"
              checked={pitr}
              onCheckedChange={(checked) => setPitr(Boolean(checked))}
              disabled={!canModify || !database.pitrEnabled}
            />
            <Label
              htmlFor="pitr-toggle"
              className="font-normal leading-snug"
            >
              Aktifkan point-in-time recovery (PITR)
            </Label>
          </div>
          <div className="col-span-full flex items-center gap-3">
            <Checkbox
              id="auto-backup"
              defaultChecked
              disabled={!canModify}
            />
            <Label htmlFor="auto-backup" className="font-normal">
              Aktifkan backup otomatis
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal/Waktu</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map(({ backup, ready }) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.createdAtLabel}</TableCell>
                  <TableCell>{backup.sizeLabel}</TableCell>
                  <TableCell>{typeBadge(backup.type)}</TableCell>
                  <TableCell>
                    {ready ? (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Siap
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Berlangsung
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canModify || !ready}
                      onClick={() =>
                        openRestore(
                          `Backup ${backup.createdAtLabel} — ${backup.sizeLabel}`
                        )
                      }
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {database.pitrEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Point-in-Time Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pitr-date">Tanggal</Label>
                <Input
                  id="pitr-date"
                  type="date"
                  aria-label="Tanggal PITR"
                  disabled={!canModify}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pitr-time">Waktu</Label>
                <Input
                  id="pitr-time"
                  type="time"
                  aria-label="Waktu PITR"
                  disabled={!canModify}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary">
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-primary bg-background"
                  style={{ right: "8px" }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-muted-foreground">
                Sekarang
              </div>
            </div>

            <div className="rounded-lg bg-yellow-500/10 px-4 py-3 text-xs text-yellow-700 dark:text-yellow-400">
              Ini akan membuat database BARU dengan data pada titik waktu ini.
              Database saat ini TIDAK akan terpengaruh.
            </div>

            <Button
              disabled={!canModify}
              onClick={() =>
                openRestore("Titik waktu yang dipilih di atas")
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore ke Titik Waktu
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button disabled={!canModify} onClick={handleCreateBackup}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Backup Manual
        </Button>
      </div>

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore dari backup ini?</DialogTitle>
            <DialogDescription>{restoreSubtitle}</DialogDescription>
            <DialogDescription>
              Database BARU akan dibuat dengan data pada waktu backup. Database
              saat ini tidak terpengaruh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => setRestoreOpen(false)}>
              Buat Database Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
