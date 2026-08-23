import type { Metadata } from "next"
import { ProjectList } from "./project-list"

export const metadata: Metadata = {
  title: "Projects - OmniStack",
  description: "Kelola semua proyek deployment Anda",
}

export default function ProjectsPage() {
  return <ProjectList />
}
