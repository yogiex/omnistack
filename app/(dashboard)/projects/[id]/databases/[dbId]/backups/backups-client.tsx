"use client"

import { useAuth } from "@/lib/auth-context"
import type { MockDatabase } from "@/lib/mock-data"
import { BackupManager } from "../_components/backup-manager"

export function BackupsClient({ database }: { database: MockDatabase }) {
  const { user } = useAuth()
  return <BackupManager database={database} role={user?.role ?? "VIEWER"} />
}
