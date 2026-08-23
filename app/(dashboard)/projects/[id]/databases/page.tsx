import { MOCK_PROJECTS } from "@/lib/mock-data"
import { DatabasesClient } from "./databases-client"

export function generateStaticParams() {
  return MOCK_PROJECTS.map((project) => ({ id: project.id }))
}

export default async function ProjectDatabasesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DatabasesClient projectId={id} />
}
