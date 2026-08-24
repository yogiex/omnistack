"use client"

import { useAuth } from "@/lib/auth-context"
import { roleAtLeast } from "@/lib/mock-data"
import { IdeShell } from "./_components/ide-shell"

interface IdeClientProps {
  projectId: string
  projectName: string
}

export function IdeClient({ projectId, projectName }: IdeClientProps) {
  const { user } = useAuth()
  const canWrite = !!user && roleAtLeast(user.role, "USER")

  return (
    <IdeShell
      projectId={projectId}
      projectName={projectName}
      canWrite={canWrite}
    />
  )
}
