"use client"

import { useState } from "react"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Link2,
  TriangleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { MockDatabase } from "@/lib/mock-data"

interface ConnectionDialogProps {
  database: MockDatabase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectionDialog({
  database,
  open,
  onOpenChange,
}: ConnectionDialogProps) {
  const [showUriPassword, setShowUriPassword] = useState(false)
  const [showRowPassword, setShowRowPassword] = useState(false)
  const [copied, setCopied] = useState<{
    dbId: string
    key: string
    at: number
  } | null>(null)

  // Reset "Tersalin!" saat dialog dibuka untuk database lain:
  // penyesuaian saat render (bukan setState di useEffect).
  const activeCopy =
    copied && copied.dbId === (database?.id ?? "") ? copied.key : null

  if (!database) return null

  const conn = database.connection

  const scheme =
    database.engine === "POSTGRES"
      ? "postgresql"
      : database.engine === "MYSQL"
        ? "mysql"
        : database.engine === "REDIS"
          ? "redis"
          : "mongodb+srv"

  const realUri = `${scheme}://${conn.username}:${conn.password}@${conn.host}:${conn.port}/${conn.database}`
  const displayedUri = showUriPassword ? realUri : conn.uri

  const cliCommand =
    database.engine === "POSTGRES"
      ? `psql "${realUri}"`
      : database.engine === "MYSQL"
        ? `mysql -h ${conn.host} -P ${conn.port} -u ${conn.username} -p ${conn.database}`
        : database.engine === "REDIS"
          ? `redis-cli -h ${conn.host} -p ${conn.port} -a ${conn.password} --tls`
          : `mongosh "mongodb+srv://${conn.host}/${conn.database}"`

  const envBlock = [
    `DATABASE_URL="${conn.uri}"`,
    `DB_HOST="${conn.host}"`,
    `DB_PORT="${conn.port}"`,
    `DB_USER="${conn.username}"`,
  ].join("\n")

  let copySeq = 0
  const handleCopy = (text: string) => {
    const key = `${text}-${++copySeq}`
    void navigator.clipboard.writeText(text).then(() => {
      setCopied({ dbId: database.id, key, at: Date.now() })
      window.setTimeout(() => {
        setCopied((current) => (current && current.key === key ? null : current))
      }, 2000)
    })
  }

  const renderCopyButton = (text: string, className?: string) => {
    const isCopied = activeCopy !== null && activeCopy.startsWith(`${text}-`)
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isCopied ? "Tersalin" : "Salin ke clipboard"}
        className={className}
        onClick={() => handleCopy(text)}
      >
        {isCopied ? (
          <Check className="size-3.5 text-green-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    )
  }

  const paramRows: Array<{ label: string; value: string; secret?: boolean }> = [
    { label: "Host", value: conn.host },
    { label: "Port", value: String(conn.port) },
    { label: "Database", value: conn.database },
    { label: "Username", value: conn.username },
    { label: "Password", value: conn.password, secret: true },
    { label: "SSL Mode", value: conn.sslMode },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl")} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-4 text-muted-foreground" />
            Detail Koneksi
          </DialogTitle>
          <DialogDescription>
            Informasi koneksi untuk database{" "}
            <span className="font-medium text-foreground">{database.name}</span>
            .
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="uri">
          <TabsList>
            <TabsTrigger value="uri">URI</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
            <TabsTrigger value="cli">CLI</TabsTrigger>
          </TabsList>

          <TabsContent value="uri" className="mt-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-uri">Connection String</Label>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 pr-20 font-mono text-xs break-all whitespace-pre-wrap">
                  <code>{displayedUri}</code>
                </pre>
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      showUriPassword
                        ? "Sembunyikan password pada URI"
                        : "Tampilkan password pada URI"
                    }
                    onClick={() => setShowUriPassword((v) => !v)}
                  >
                    {showUriPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                  {renderCopyButton(realUri)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Parameter Individual</p>
              <div className="divide-y rounded-lg border">
                {paramRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="w-24 shrink-0 text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">
                      {row.secret && !showRowPassword
                        ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                        : row.value}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {row.secret && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={
                            showRowPassword
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                          onClick={() => setShowRowPassword((v) => !v)}
                        >
                          {showRowPassword ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                      )}
                      {renderCopyButton(row.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-yellow-600" />
              Jaga kerahasiaan kredensial. Segera rotasi password jika
              terkompromi.
            </p>
          </TabsContent>

          <TabsContent value="env" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="rounded-lg bg-muted p-4 font-mono text-xs whitespace-pre-wrap">
                <code>{envBlock}</code>
              </pre>
              <div className="absolute top-2 right-2">
                {renderCopyButton(envBlock)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cli" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="rounded-lg bg-muted p-4 font-mono text-xs break-all whitespace-pre-wrap">
                <code>{cliCommand}</code>
              </pre>
              <div className="absolute top-2 right-2">
                {renderCopyButton(cliCommand)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
