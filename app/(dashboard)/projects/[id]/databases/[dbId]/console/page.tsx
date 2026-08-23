import { MOCK_DATABASES } from "@/lib/mock-data"
import { QueryConsole } from "../_components/query-console"

export function generateStaticParams() {
  return MOCK_DATABASES.map((db) => ({ id: db.projectId, dbId: db.id }))
}

export default async function DatabaseConsolePage({
  params,
}: {
  params: Promise<{ id: string; dbId: string }>
}) {
  const { dbId } = await params
  const database = MOCK_DATABASES.find((d) => d.id === dbId)
  if (!database) return null
  return <QueryConsole database={database} />
}
