"use client"

import { ChevronDown, File, Folder, FolderOpen } from "lucide-react"
import { IDE_FILE_TREE, type IdeFileNode } from "@/lib/mock-ide-data"
import { cn } from "@/lib/utils"

interface IdeFileExplorerProps {
  activePath: string
  onOpenFile: (path: string) => void
}

export function IdeFileExplorer({ activePath, onOpenFile }: IdeFileExplorerProps) {
  const renderNode = (node: IdeFileNode, depth: number) => {
    const padding = { paddingLeft: `${depth * 12 + 8}px` }
    const isActive = node.path === activePath

    if (node.type === "dir") {
      return (
        <div key={node.path}>
          <button
            type="button"
            className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-[13px] text-muted-foreground hover:bg-accent"
            style={padding}
          >
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            <FolderOpen className="h-4 w-4 shrink-0 text-sky-500" />
            <span className="truncate">{node.name}</span>
          </button>
          {node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      )
    }

    return (
      <button
        key={node.path}
        type="button"
        onClick={() => onOpenFile(node.path)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-[13px] hover:bg-accent",
          isActive ? "bg-accent text-foreground" : "text-muted-foreground"
        )}
        style={padding}
      >
        <File
          className={cn(
            "h-4 w-4 shrink-0",
            node.language === "tsx"
              ? "text-sky-500"
              : node.language === "ts"
                ? "text-blue-500"
                : "text-muted-foreground"
          )}
        />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-muted/10">
      <div className="flex h-8 items-center justify-between border-b px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Explorer</span>
        <span className="font-normal normal-case">⌘1</span>
      </div>
      <div className="flex items-center gap-1 px-2 pt-2 text-[13px] font-medium">
        <Folder className="h-4 w-4 text-sky-500" />
        acme-store
      </div>
      <div className="min-h-0 flex-1 overflow-auto py-1">
        {IDE_FILE_TREE[0]?.children
          ? IDE_FILE_TREE[0].children.map((child) =>
              renderNode(child, 1)
            )
          : null}
      </div>
    </aside>
  )
}
