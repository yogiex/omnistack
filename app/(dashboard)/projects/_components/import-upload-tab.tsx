"use client"

import { useRef, useState } from "react"
import { FileArchive, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MAX_UPLOAD_BYTES, analyzeSource, formatBytes } from "@/lib/source-utils"
import type { ProjectSource } from "@/lib/mock-data"
import { SourceStackPreview } from "./source-stack-preview"

interface ImportUploadTabProps {
  source?: ProjectSource
  onSourceChange: (source: ProjectSource | undefined) => void
  onNameSuggestion: (name: string) => void
}

const ZIP_EXTENSIONS = [".zip", ".tar", ".tgz", ".tar.gz"]

function isArchive(name: string): boolean {
  const lower = name.toLowerCase()
  return ZIP_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export function ImportUploadTab({
  source,
  onSourceChange,
  onNameSuggestion,
}: ImportUploadTabProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFile = (file: File) => {
    if (!isArchive(file.name)) {
      setError("Gunakan arsip .zip, .tar, atau .tgz.")
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Ukuran maksimum ${formatBytes(MAX_UPLOAD_BYTES)}.`)
      return
    }
    setError(null)
    const baseName = file.name.replace(/\.(zip|tar\.gz|tgz|tar)$/i, "")
    onNameSuggestion(baseName)
    onSourceChange(
      analyzeSource({
        kind: "upload",
        fileName: file.name,
        fileSizeBytes: file.size,
      })
    )
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  const clearFile = () => {
    setError(null)
    onSourceChange(undefined)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Unggah arsip proyek</p>
        <p className="text-xs text-muted-foreground">
          Arsipkan folder proyek Anda, lalu letakkan file di area berikut.
          Maksimum {formatBytes(MAX_UPLOAD_BYTES)}.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Area unggah arsip proyek"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          error && "border-destructive/60"
        )}
      >
        {source?.fileName ? (
          <>
            <FileArchive className="size-8 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{source.fileName}</p>
              {typeof source.fileSizeBytes === "number" && (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(source.fileSizeBytes)}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <UploadCloud
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">
                Tarik &amp; lepas file, atau klik untuk memilih
              </p>
              <p className="text-xs text-muted-foreground">
                Format didukung: .zip, .tar, .tgz
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".zip,.tar,.tgz,application/zip,application/x-tar"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) applyFile(file)
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {source?.fileName && (
        <Button type="button" variant="outline" size="sm" onClick={clearFile}>
          Ganti file
        </Button>
      )}

      <SourceStackPreview detectedStack={source?.detectedStack} />

      <p className="text-xs text-muted-foreground">
        Arsip tidak diunggah dari browser mock ini — analisis stack dijalankan
        lokal. Saat backend aktif, file dikirim ke runner build OmniStack.
      </p>
    </div>
  )
}