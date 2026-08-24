"use client"

import { useState } from "react"
import { Search, CornerDownLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { IDE_PALETTE, type PaletteAction } from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

interface IdeCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (id: string) => void
}

const GROUP_ORDER: PaletteAction["group"][] = ["RECENT", "ACTIONS", "AI"]

export function IdeCommandPalette({
  open,
  onOpenChange,
  onAction,
}: IdeCommandPaletteProps) {
  const [query, setQuery] = useState("")

  const normalized = query.trim().toLowerCase()
  const filtered = IDE_PALETTE.filter((action) =>
    action.label.toLowerCase().includes(normalized)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[20%] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Cari dan jalankan aksi Cloud IDE
        </DialogDescription>

        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Cari aksi"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">esc</kbd>
        </div>

        <div className="max-h-80 overflow-auto p-2">
          {GROUP_ORDER.map((group) => {
            const actions = filtered.filter((a) => a.group === group)
            if (actions.length === 0) return null
            return (
              <div key={group} className="mb-1">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onAction(action.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                    )}
                  >
                    <span className="flex-1 truncate">{action.label}</span>
                    {action.shortcut && (
                      <kbd className="font-mono text-[10px] text-muted-foreground">
                        {action.shortcut}
                      </kbd>
                    )}
                    <CornerDownLeft className="h-3 w-3 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Tidak ada hasil untuk &quot;{query}&quot;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
