"use client"

import { useState } from "react"
import { FileArchive, GitBranch, PenLine } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { ProjectSource, ProjectSourceKind } from "@/lib/mock-data"
import { ImportUploadTab } from "./import-upload-tab"
import { ImportGitTab } from "./import-git-tab"

export interface ProjectForm {
  name: string
  description: string
  source?: ProjectSource
}

export const EMPTY_PROJECT_FORM: ProjectForm = { name: "", description: "" }

type ImportTab = Extract<ProjectSourceKind, "manual" | "upload" | "git">

interface ProjectFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  form: ProjectForm
  onFormChange: (form: ProjectForm) => void
  onSubmit: () => void
}

export function ProjectFormSheet({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  onSubmit,
}: ProjectFormSheetProps) {
  const [tab, setTab] = useState<ImportTab>("manual")

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setTab("manual")
  }

  const setSource = (source: ProjectSource | undefined) => {
    onFormChange({ ...form, source })
  }

  const suggestName = (name: string) => {
    if (!name || form.name.trim()) return
    onFormChange({ ...form, name, source: form.source })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Buat Proyek Baru" : "Edit Proyek"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Buat dari nol, unggah arsip, atau impor dari repositori Git."
              : "Ubah nama atau deskripsi proyek."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-4">
            {mode === "create" ? (
              <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as ImportTab)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="manual">
                    <PenLine className="size-3.5" aria-hidden="true" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <FileArchive className="size-3.5" aria-hidden="true" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="git">
                    <GitBranch className="size-3.5" aria-hidden="true" />
                    Git URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-4 flex flex-col gap-4">
                  <ProjectMetaFields
                    form={form}
                    onFormChange={onFormChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Proyek akan terdaftar dengan status{" "}
                    <BadgeActive /> dan menjadi milik akun Anda.
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="mt-4 flex flex-col gap-4">
                  <ProjectNameField form={form} onFormChange={onFormChange} />
                  <ImportUploadTab
                    source={form.source?.kind === "upload" ? form.source : undefined}
                    onSourceChange={setSource}
                    onNameSuggestion={suggestName}
                  />
                </TabsContent>

                <TabsContent value="git" className="mt-4 flex flex-col gap-4">
                  <ProjectNameField form={form} onFormChange={onFormChange} />
                  <ImportGitTab
                    source={form.source?.kind === "git" ? form.source : undefined}
                    onSourceChange={setSource}
                    onNameSuggestion={suggestName}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <ProjectMetaFields form={form} onFormChange={onFormChange} />
            )}
          </div>

          <SheetFooter>
            <Button
              type="submit"
              disabled={!form.name.trim() || (mode === "create" && !canSubmit(tab, form))}
            >
              {mode === "create" ? "Buat Proyek" : "Simpan Perubahan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function canSubmit(tab: ImportTab, form: ProjectForm): boolean {
  if (tab === "manual") return true
  const source = form.source
  if (!source) return false
  return source.kind === tab
}

interface ProjectMetaFieldsProps {
  form: ProjectForm
  onFormChange: (form: ProjectForm) => void
}

function ProjectMetaFields({ form, onFormChange }: ProjectMetaFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProjectNameField form={form} onFormChange={onFormChange} />

      <div className="space-y-2">
        <Label htmlFor="project-form-description">Deskripsi</Label>
        <Input
          id="project-form-description"
          value={form.description}
          onChange={(event) =>
            onFormChange({ ...form, description: event.target.value })
          }
          placeholder="Deskripsi singkat proyek"
        />
      </div>
    </div>
  )
}

function ProjectNameField({ form, onFormChange }: ProjectMetaFieldsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="project-form-name">Nama Proyek</Label>
      <Input
        id="project-form-name"
        value={form.name}
        onChange={(event) =>
          onFormChange({ ...form, name: event.target.value })
        }
        placeholder="my-awesome-app"
      />
    </div>
  )
}

function BadgeActive({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded border px-1 py-0.5 font-medium text-green-500",
        className
      )}
    >
      Active
    </span>
  )
}