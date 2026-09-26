import type { Metadata } from "next"
import { ProjectList } from "./project-list"

export const metadata: Metadata = {
  title: "Projects — OmniStack",
  description: "Kelola semua proyek deployment Anda",
}

/**
 * Shell statis. Seluruh state (filter, sort, sheet, RBAC) ada di
 * <ProjectList /> sebagai Client Component.
 *
 * Route `/projects/[id]` butuh `generateStaticParams` agar bisa diprerender
 * untuk static export — belum ada, lihat docs/audits/PROJECT-AUDIT.md (C7).
 */

export default function ProjectsPage() {
  return <ProjectList />
}
