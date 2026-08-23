"use client"

import { useState } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { PromptPanel } from "./prompt-panel"
import { PreviewPanel } from "./preview-panel"
import type { PromptType } from "./mock-previews"
import { cn } from "@/lib/utils"

export function AIStudio() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptType, setPromptType] = useState<PromptType>(null)

  return (
    <Group orientation="horizontal" className="h-full w-full">
      <Panel id="prompt" defaultSize="35%" minSize="25%">
        <PromptPanel
          onGenerate={(url) => setPreviewUrl(url)}
          isLoading={isGenerating}
          setIsLoading={setIsGenerating}
          onPromptType={setPromptType}
        />
      </Panel>

      <Separator
        className={cn(
          "relative w-px bg-border transition-colors",
          "hover:bg-primary/50"
        )}
      />

      <Panel id="preview" defaultSize="65%" minSize="40%">
        <PreviewPanel
          previewUrl={previewUrl}
          isLoading={isGenerating}
          promptType={promptType}
        />
      </Panel>
    </Group>
  )
}
