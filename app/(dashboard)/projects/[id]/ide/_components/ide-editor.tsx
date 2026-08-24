"use client"

import { X } from "lucide-react"
import { IDE_OPEN_TABS } from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

interface IdeEditorProps {
  activePath: string
  lines: string[]
}

export function IdeEditor({ activePath, lines }: IdeEditorProps) {
  const shortName = activePath.split("/").pop()

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-8 shrink-0 border-b bg-muted/10">
        {IDE_OPEN_TABS.map((path) => {
          const tabName = path.split("/").pop()
          const active = path === activePath
          return (
            <div
              key={path}
              className={cn(
                "flex items-center gap-1.5 border-r px-3 text-xs",
                active
                  ? "bg-background text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span>{tabName}</span>
              <button
                type="button"
                aria-label={`Close ${tabName}`}
                className="rounded-sm hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto bg-background font-mono text-[13px]">
        <div
          className="select-none border-r px-3 py-3 text-right text-muted-foreground/60"
          aria-hidden="true"
        >
          {lines.map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 overflow-auto px-4 py-3 leading-6 text-foreground">
          {lines.join("\n")}
        </pre>
      </div>

      <div className="hidden border-t px-3 py-1 text-xs text-muted-foreground">
        {shortName} — read-only preview (mock). Editing membutuhkan Monaco di fase berikutnya.
      </div>
    </section>
  )
}
