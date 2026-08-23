import { MOCK_DATABASES } from "@/lib/mock-data"
import { BackupsClient } from "./backups-client"

export function generateStaticParams() {
  return MOCK_DATABASES.map((db) => ({ id: db.projectId, dbId: db.id }))
}

export default async function DatabaseBackupsPage({
  params,
}: {
  params: Promise<{ id: string; dbId: string }>
}) {
  const { dbId } = await params
  const database = MOCK_DATABASES.find((d) => d.id === dbId)
  if (!database) return null
  return <BackupsClient database={database} />
}
