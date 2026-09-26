import { CheckCircle2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ProjectsNoticeProps {
  message: string
  onDismiss: () => void
  className?: string
}

export function ProjectsNotice({
  message,
  onDismiss,
  className,
}: ProjectsNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary",
        className
      )}
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tutup notifikasi"
        onClick={onDismiss}
        className="size-6 shrink-0 text-primary/70 hover:bg-primary/10 hover:text-primary"
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}
