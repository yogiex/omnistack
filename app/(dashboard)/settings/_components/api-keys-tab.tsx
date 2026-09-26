"use client"

import { Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { maskKey, type ApiKeyItem } from "@/lib/settings/mock-settings"

interface ApiKeysTabProps {
  keys: ApiKeyItem[]
  copiedId: string | null
  onGenerate: () => void
  onCopy: (key: ApiKeyItem) => void
  onRevoke: (id: string) => void
}

export function ApiKeysTab({
  keys,
  copiedId,
  onGenerate,
  onCopy,
  onRevoke,
}: ApiKeysTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Gunakan API key untuk autentikasi CLI &amp; CI/CD.
          </CardDescription>
        </div>
        <Button size="sm" onClick={onGenerate} className="shrink-0">
          <Plus />
          Generate New Key
        </Button>
      </CardHeader>

      <CardContent>
        {keys.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada API key. Klik &quot;Generate New Key&quot; untuk membuat.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <KeyRound
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {maskKey(k.fullKey)} · dibuat {k.createdAt}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onCopy(k)}>
                  {copiedId === k.id ? (
                    <>
                      <Check className="text-emerald-600 dark:text-emerald-400" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRevoke(k.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
