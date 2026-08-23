import { MOCK_PROJECTS } from "@/lib/mock-data"
import { ProjectDetailClient } from "./project-detail-client"

export function generateStaticParams() {
  return MOCK_PROJECTS.map((project) => ({
    id: project.id,
  }))
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProjectDetailClient projectId={id} />
}
