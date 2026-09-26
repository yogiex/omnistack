import Link from "next/link"
import { FolderGit2, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Role } from "@/lib/mock-data"

interface ProjectsEmptyNoneProps {
  role: Role
  canCreate: boolean
  onCreate: () => void
}

export function ProjectsEmptyNone({
  role,
  canCreate,
  onCreate,
}: ProjectsEmptyNoneProps) {
  const isViewer = role === "VIEWER"

  return (
    <Card>
      <CardContent className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <FolderGit2 className="size-9 text-primary" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Belum ada proyek</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {isViewer
            ? "Minta admin atau developer meng-share proyek ke akun Anda."
            : "Buat deployment pertama Anda dan mulai membangun aplikasi luar biasa."}
        </p>

        {canCreate && (
          <Button size="sm" onClick={onCreate} className="mt-5 gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Buat Proyek Baru
          </Button>
        )}

        {!isViewer && (
          <p className="mt-3 text-xs text-muted-foreground">
            Atau generate instan dengan{" "}
            <Link
              href="/ai-architect"
              className="inline-flex items-center gap-0.5 text-primary underline-offset-4 hover:underline"
            >
              <Sparkles className="size-3" aria-hidden="true" />
              AI Architect
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
