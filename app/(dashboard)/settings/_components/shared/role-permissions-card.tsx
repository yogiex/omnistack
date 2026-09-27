import { BadgeCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Role } from "@/lib/mock-data"
import { PERMISSION_SUMMARY, ROLE_META } from "@/lib/settings/constants"

interface RolePermissionsCardProps {
  role: Role
}

export function RolePermissionsCard({ role }: RolePermissionsCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Hak Akses Anda</CardTitle>
        <CardDescription>{ROLE_META[role].description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {PERMISSION_SUMMARY[role].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <BadgeCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
