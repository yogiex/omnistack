"use client"

import { useAuth } from "@/lib/auth-context"
import { roleAtLeast } from "@/lib/mock-data"
import { IdeShell } from "./_components/ide-shell"

interface IdeClientProps {
  projectName: string
}

export function IdeClient({ projectName }: IdeClientProps) {
  const { user } = useAuth()
  const canWrite = !!user && roleAtLeast(user.role, "USER")

  return <IdeShell projectName={projectName} canWrite={canWrite} />
}
