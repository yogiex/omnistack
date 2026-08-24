import { notFound } from "next/navigation"
import { MOCK_PROJECTS } from "@/lib/mock-data"
import { IdeClient } from "./ide-client"

export function generateStaticParams() {
  return MOCK_PROJECTS.map((project) => ({ id: project.id }))
}

export default async function ProjectIdePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = MOCK_PROJECTS.find((p) => p.id === id)

  if (!project) {
    notFound()
  }

  return <IdeClient projectName={project.name} />
}
