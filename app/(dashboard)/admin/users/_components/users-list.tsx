"use client"

import { useEffect, useRef } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getUserStatus, type MockUser } from "@/lib/mock-data"

import { UsersEmptyFiltered, UsersEmptyNone } from "./empty-state"
import { UserRow, type UserRowHandlers } from "./user-row"
import { UsersPagination } from "./users-pagination"

interface GroupSectionProps {
  title: string
  count: number
  groupIds: string[]
  selectedIds: Set<string>
  onToggleGroup: (checked: boolean) => void
  children: React.ReactNode
}

function GroupSection({
  title,
  count,
  groupIds,
  selectedIds,
  onToggleGroup,
  children,
}: GroupSectionProps) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const selectedInGroup = groupIds.filter((id) => selectedIds.has(id)).length
  const allSelected = selectedInGroup === groupIds.length
  const someSelected = selectedInGroup > 0 && !allSelected

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  if (count === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          ref={checkboxRef}
          checked={allSelected}
          onCheckedChange={onToggleGroup}
          aria-label={`Pilih semua ${title}`}
        />
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

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
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
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
  selectedIds,
  onSelectionChange,
  onClearFilters,
  onPrev,
  onNext,
}: UsersListProps) {
  const groups: {
    key: string
    title: string
    users: MockUser[]
  }[] = [
    {
      key: "active",
      title: "User Aktif",
      users: users.filter((u) => getUserStatus(u) === "active"),
    },
    {
      key: "invited",
      title: "Undangan Pending",
      users: users.filter((u) => getUserStatus(u) === "invited"),
    },
    {
      key: "suspended",
      title: "Ditangguhkan",
      users: users.filter((u) => getUserStatus(u) === "suspended"),
    },
  ]

  const toggleGroup = (groupUsers: MockUser[]) => (checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) {
      for (const u of groupUsers) {
        if (!isSelf(u)) next.add(u.id)
      }
    } else {
      for (const u of groupUsers) next.delete(u.id)
    }
    onSelectionChange(next)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {users.length === 0 ? (
          hasFilters || searchQuery ? (
            <UsersEmptyFiltered
              searchQuery={searchQuery}
              onClearFilters={onClearFilters}
            />
          ) : (
            <UsersEmptyNone onInvite={() => {}} />
          )
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <GroupSection
                key={group.key}
                title={group.title}
                count={group.users.length}
                groupIds={group.users.map((u) => u.id)}
                selectedIds={selectedIds}
                onToggleGroup={toggleGroup(group.users)}
              >
                {group.users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={isSelf(user)}
                    has2FA={has2FA(user.id)}
                    canSuspend={canSuspend(user)}
                    canDelete={canDelete(user)}
                    selected={selectedIds.has(user.id)}
                    onSelectedChange={(checked) => {
                      const next = new Set(selectedIds)
                      if (checked) next.add(user.id)
                      else next.delete(user.id)
                      onSelectionChange(next)
                    }}
                    handlers={handlers}
                  />
                ))}
              </GroupSection>
            ))}
          </div>
        )}

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
