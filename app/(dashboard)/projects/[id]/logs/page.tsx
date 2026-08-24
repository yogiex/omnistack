import { notFound } from "next/navigation"
import { MOCK_PROJECTS } from "@/lib/mock-data"
import { LogsClient } from "./_components/logs-client"

export function generateStaticParams() {
  return MOCK_PROJECTS.map((project) => ({
    id: project.id,
  }))
}

export default async function LogsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = MOCK_PROJECTS.find((p) => p.id === id)
  if (!project) notFound()

  return <LogsClient projectId={id} projectName={project.name} />
}
