import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MOCK_PROJECTS, MOCK_USERS, type MockDatabase } from "@/lib/mock-data"

import { DatabaseEngineBadge } from "./database-engine-badge"
import { DatabaseStatusBadge } from "./database-status-badge"

interface DatabasesTableProps {
  databases: MockDatabase[]
}

/**
 * Baris tidak punya `onClick`. Tautan ada di sel nama, jadi `Tab` +
 * `Enter` bekerja, cmd/middle-click membuka tab baru, dan screen reader
 * membacakan lima kolom lalu tautannya — bukan satu tombol besar yang
 * namanya cuma "row".
 */
export function DatabasesTable({ databases }: DatabasesTableProps) {
  const ownerName = (ownerId: string) =>
    MOCK_USERS.find((u) => u.id === ownerId)?.name ?? ownerId

  const projectName = (projectId: string) =>
    MOCK_PROJECTS.find((p) => p.id === projectId)?.name ?? projectId

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Database</TableHead>
          <TableHead>Engine</TableHead>
          <TableHead className="hidden md:table-cell">Proyek</TableHead>
          <TableHead className="hidden lg:table-cell">Pemilik</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {databases.map((db) => (
          <TableRow key={db.id}>
            <TableCell className="max-w-0">
              <Link
                href={`/projects/${db.projectId}/databases/${db.id}`}
                className="block truncate font-medium underline-offset-4 hover:text-primary hover:underline focus-visible:underline focus-visible:outline-none"
              >
                {db.name}
              </Link>
              <span className="text-xs text-muted-foreground lg:hidden">
                {projectName(db.projectId)}
              </span>
            </TableCell>
            <TableCell>
              <DatabaseEngineBadge engine={db.engine} version={db.version} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {projectName(db.projectId)}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {ownerName(db.ownerId)}
            </TableCell>
            <TableCell>
              <DatabaseStatusBadge status={db.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
