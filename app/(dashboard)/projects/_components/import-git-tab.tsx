"use client"

import { useState } from "react"
import { GitBranch, Link2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  analyzeSource,
  detectGitProvider,
  isValidBranchRef,
  repoNameFromUrl,
  validateGitUrl,
} from "@/lib/source-utils"
import type { ProjectSource, ProjectSourceProvider } from "@/lib/mock-data"
import { SourceStackPreview } from "./source-stack-preview"

interface ImportGitTabProps {
  source?: ProjectSource
  onSourceChange: (source: ProjectSource | undefined) => void
  onNameSuggestion: (name: string) => void
}

const PROVIDER_LABEL: Record<ProjectSourceProvider, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  generic: "Git generik",
}

/** Host Git pribadi yang diizinkan admin (mock). */
const SELF_HOSTED_HOSTS = ["git.omnistack.dev"]

export function ImportGitTab({
  source,
  onSourceChange,
  onNameSuggestion,
}: ImportGitTabProps) {
  const [repoUrl, setRepoUrl] = useState(source?.repoUrl ?? "")
  const [branch, setBranch] = useState(source?.branch ?? "main")
  const [touched, setTouched] = useState(false)

  const urlError = validateGitUrl(repoUrl)
  const branchError = isValidBranchRef(branch) ? null : "Nama branch tidak valid."
  const provider = repoUrl ? detectGitProvider(repoUrl) : "generic"
  const host = getHost(repoUrl)
  const isAllowedHost =
    !host ||
    (["github.com", "gitlab.com"] as string[]).includes(host) ||
    SELF_HOSTED_HOSTS.includes(host)

  const handleUrlChange = (value: string) => {
    setRepoUrl(value)
    const error = validateGitUrl(value)
    if (error) {
      onSourceChange(undefined)
      return
    }
    onNameSuggestion(repoNameFromUrl(value))
    onSourceChange(
      analyzeSource({
        kind: "git",
        provider: detectGitProvider(value),
        repoUrl: value.trim(),
        branch: branch.trim(),
      })
    )
  }

  const handleBranchChange = (value: string) => {
    setBranch(value)
    if (!source) return
    onSourceChange({ ...source, branch: value.trim() })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="import-git-url">URL Repositori</Label>
        <div className="relative">
          <Link2
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="import-git-url"
            value={repoUrl}
            onChange={(event) => handleUrlChange(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://github.com/owner/repo"
            className="pl-8 font-mono text-xs"
            autoComplete="off"
            aria-invalid={touched && urlError !== null}
          />
        </div>
        {touched && urlError && (
          <p role="alert" className="text-xs text-destructive">
            {urlError}
          </p>
        )}
        {!urlError && repoUrl && (
          <p className="text-xs text-muted-foreground">
            Terdeteksi:{" "}
            <span className="font-medium text-foreground">
              {PROVIDER_LABEL[provider]}
            </span>
            {!isAllowedHost && (
              <span className="text-destructive">
                {" "}
                — host ini belum diizinkan admin
              </span>
            )}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="import-git-branch">Branch</Label>
        <div className="relative">
          <GitBranch
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="import-git-branch"
            value={branch}
            onChange={(event) => handleBranchChange(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="main"
            className="pl-8 font-mono text-xs"
            autoComplete="off"
            aria-invalid={touched && branchError !== null}
          />
        </div>
        {touched && branchError && (
          <p role="alert" className="text-xs text-destructive">
            {branchError}
          </p>
        )}
      </div>

      <SourceStackPreview detectedStack={source?.detectedStack} />

      <p
        className={cn(
          "rounded-lg border p-3 text-xs text-muted-foreground",
          "border-border"
        )}
      >
        Hanya URL <span className="font-medium text-foreground">publik</span>{" "}
        untuk sekarang. Integrasi OAuth GitHub App / GitLab (&amp; repo privat)
        menyusul saat backend aktif — lihat{" "}
        <span className="font-mono">next-update-fitur-git-integration.md</span>.
      </p>
    </div>
  )
}

function getHost(url: string): string {
  try {
    return new URL(url.trim()).hostname.toLowerCase()
  } catch {
    return ""
  }
}