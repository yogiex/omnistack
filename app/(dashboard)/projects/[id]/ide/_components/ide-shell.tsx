"use client"

import { useEffect, useState } from "react"
import {
  IDE_FILE_TREE,
  IDE_BRANCH,
  IDE_CODE,
  IDE_METRICS,
  IDE_OPEN_TABS,
  IDE_NODE,
} from "@/lib/mock-ide-data"
import { IdeTopBar } from "./ide-top-bar"
import { IdeActivityBar } from "./ide-activity-bar"
import { IdeFileExplorer } from "./ide-file-explorer"
import { IdeEditor } from "./ide-editor"
import { IdeRightPanel } from "./ide-right-panel"
import { IdeBottomPanel } from "./ide-bottom-panel"
import { IdeStatusBar } from "./ide-status-bar"
import { IdeCommandPalette } from "./ide-command-palette"
import { IdeDeployDialog } from "./ide-deploy-dialog"

type RightMode = "preview" | "ai" | "metrics"
type BottomTab = "terminal" | "problems" | "output"

interface IdeShellProps {
  projectId: string
  projectName: string
  canWrite: boolean
}

export function IdeShell({ projectId, projectName, canWrite }: IdeShellProps) {
  const [activePath, setActivePath] = useState<string>(
    IDE_OPEN_TABS[0] ?? IDE_FILE_TREE[0]?.path ?? ""
  )
  const [explorerOpen, setExplorerOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [rightMode, setRightMode] = useState<RightMode>("preview")
  const [bottomOpen, setBottomOpen] = useState(true)
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal")
  const [commandOpen, setCommandOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved")

  const activeCode = IDE_CODE[activePath] ?? ["// no content"]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleOpenFile = (path: string) => {
    if (path === activePath) return
    setActivePath(path)
    setSaveState("saving")
    window.setTimeout(() => setSaveState("saved"), 600)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border bg-background">
      <IdeTopBar
        projectName={projectName}
        branch={IDE_BRANCH}
        saveState={saveState}
        canWrite={canWrite}
        onDeploy={() => setDeployOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <IdeActivityBar
          explorerOpen={explorerOpen}
          rightOpen={rightOpen}
          rightMode={rightMode}
          onToggleExplorer={() => setExplorerOpen((open) => !open)}
          onToggleRight={() => setRightOpen((open) => !open)}
        />

        {explorerOpen && (
          <IdeFileExplorer
            activePath={activePath}
            onOpenFile={handleOpenFile}
          />
        )}

        <IdeEditor activePath={activePath} lines={activeCode} />

        {rightOpen && (
          <IdeRightPanel
            mode={rightMode}
            onModeChange={setRightMode}
            metrics={IDE_METRICS}
            canWrite={canWrite}
          />
        )}
      </div>

      {bottomOpen && (
        <IdeBottomPanel tab={bottomTab} onTabChange={setBottomTab} />
      )}

      <IdeStatusBar
        branch={IDE_BRANCH}
        node={IDE_NODE}
        bottomOpen={bottomOpen}
        onToggleBottom={() => setBottomOpen((open) => !open)}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <IdeCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onAction={(id: string) => {
          setCommandOpen(false)
          if (id === "deploy-prod" || id === "deploy-preview") {
            setDeployOpen(true)
          }
        }}
      />

      <IdeDeployDialog
        open={deployOpen}
        onOpenChange={setDeployOpen}
        projectId={projectId}
        projectName={projectName}
        canWrite={canWrite}
      />
    </div>
  )
}
