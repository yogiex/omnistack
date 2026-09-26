"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { MockUser } from "@/lib/mock-data"

import { UsersEmptyState } from "./empty-state"
import { UserRow, type UserRowHandlers } from "./user-row"
import { UsersPagination } from "./users-pagination"

interface UsersListProps {
  users: MockUser[]
  totalCount: number
  page: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  hasFilters: boolean
  searchQuery?: string
  isSelf: (user: MockUser) => boolean
  has2FA: (id: string) => boolean
  canSuspend: (user: MockUser) => boolean
  canDelete: (user: MockUser) => boolean
  handlers: UserRowHandlers
  onClearFilters: () => void
  onPrev: () => void
  onNext: () => void
}

export function UsersList({
  users,
  totalCount,
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  hasFilters,
  searchQuery,
  isSelf,
  has2FA,
  canSuspend,
  canDelete,
  handlers,
  onClearFilters,
  onPrev,
  onNext,
}: UsersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Semua User ({totalCount})</CardTitle>
        <CardDescription>
          Kelola user aktif dan undangan pending. Kamu tidak bisa menghapus
          akunmu sendiri atau ADMIN terakhir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={isSelf(user)}
              has2FA={has2FA(user.id)}
              canSuspend={canSuspend(user)}
              canDelete={canDelete(user)}
              handlers={handlers}
            />
          ))}

          {users.length === 0 && (
            <UsersEmptyState
              hasFilters={hasFilters}
              searchQuery={searchQuery}
              onClearFilters={onClearFilters}
            />
          )}
        </div>

        <UsersPagination
          totalCount={totalCount}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
        />
      </CardContent>
    </Card>
  )
}
