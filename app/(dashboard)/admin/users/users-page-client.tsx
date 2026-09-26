"use client"

import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useNotice } from "@/hooks/use-notice"
import { useAuth } from "@/lib/auth-context"
import type { MockUser, Role } from "@/lib/mock-data"

import { useUserFilters } from "./_hooks/use-user-filters"
import { useUsers } from "./_hooks/use-users"
import { DeleteUserDialog } from "./_components/delete-user-dialog"
import { InviteUserDialog } from "./_components/invite-user-dialog"
import { StatsGrid } from "./_components/stats-grid"
import type { UserRowHandlers } from "./_components/user-row"
import { UsersFilterPills } from "./_components/users-filter-pills"
import { UsersHeader } from "./_components/users-header"
import { UsersList } from "./_components/users-list"
import { UsersToolbar } from "./_components/users-toolbar"
import {
  EMPTY_USER_FORM,
  UserFormSheet,
  type UserForm,
} from "./user-form-sheet"

export function UsersPageClient() {
  const { user: currentUser } = useAuth()
  const { notice, showNotice } = useNotice()

  const {
    users,
    isSelf,
    has2FA,
    canSuspend,
    canDelete,
    canChangeRole,
    emailExists,
    updateUser,
    invite,
    resendInvite,
    cancelInvite,
    toggleSuspend,
    toggle2FA,
    remove,
  } = useUsers({ currentUserId: currentUser?.email })

  const filters = useUserFilters({ users })

  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MockUser | null>(null)

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const openEdit = (target: MockUser) => {
    setEditId(target.id)
    setForm({ name: target.name, email: target.email, role: target.role })
  }

  const submitEdit = () => {
    if (!editId) return

    const target = users.find((u) => u.id === editId)
    if (!target) {
      setEditId(null)
      return
    }

    if (!canChangeRole(target, form.role)) {
      showNotice("Gagal: minimal harus ada 1 ADMIN aktif di sistem.")
      return
    }

    if (emailExists(form.email, editId)) {
      showNotice("Email sudah dipakai user lain.")
      return
    }

    updateUser(editId, {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    })
    showNotice(`Data ${form.name} diperbarui.`)
    setEditId(null)
  }

  const handleInvite = (email: string, role: Role) => {
    if (emailExists(email)) {
      showNotice("Gagal: email sudah terdaftar di sistem.")
      return
    }
    invite(email, role)
    setInviteOpen(false)
    showNotice(`Undangan dikirim ke ${email} dengan role ${role} (mock).`)
  }

  const handleResetPassword = (target: MockUser) => {
    showNotice(`Email reset password dikirim ke ${target.email} (mock).`)
  }

  const handleToggle2FA = (target: MockUser) => {
    const wasEnabled = has2FA(target.id)
    toggle2FA(target.id)
    showNotice(
      `${wasEnabled ? "2FA dinonaktifkan" : "2FA diaktifkan"} untuk ${target.name} (mock).`,
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (!canDelete(deleteTarget)) {
      showNotice("Gagal: tidak bisa menghapus ADMIN terakhir atau akunmu sendiri.")
      setDeleteTarget(null)
      return
    }
    remove(deleteTarget.id)
    showNotice(`${deleteTarget.name} dihapus permanen.`)
    setDeleteTarget(null)
  }

  const handlers: UserRowHandlers = {
    onEdit: openEdit,
    onResendInvite: (target) => {
      resendInvite(target.id)
      showNotice(`Undangan dikirim ulang ke ${target.email} (mock).`)
    },
    onCancelInvite: (target) => {
      cancelInvite(target.id)
      showNotice(`Undangan untuk ${target.email} dibatalkan.`)
    },
    onToggleSuspend: (target) => {
      if (!canSuspend(target)) {
        showNotice("Gagal: tidak bisa menangguhkan ADMIN terakhir atau akunmu sendiri.")
        return
      }
      toggleSuspend(target.id)
      showNotice(
        target.isActive
          ? `${target.name} ditangguhkan (tidak bisa login).`
          : `${target.name} diaktifkan kembali.`,
      )
    },
    onResetPassword: handleResetPassword,
    onToggle2FA: handleToggle2FA,
    onRequestDelete: (target) => {
      if (!canDelete(target)) {
        showNotice("Gagal: tidak bisa menghapus ADMIN terakhir atau akunmu sendiri.")
        return
      }
      setDeleteTarget(target)
    },
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="flex flex-col gap-6">
      <UsersHeader onInvite={() => setInviteOpen(true)} />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </div>
      )}

      <StatsGrid users={users} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <UsersToolbar
              search={filters.search}
              onSearchChange={filters.setSearch}
              sortField={filters.sortField}
              sortDir={filters.sortDir}
              onToggleSort={filters.toggleSort}
            />
            <UsersFilterPills
              roleFilter={filters.roleFilter}
              onRoleChange={filters.setRoleFilter}
              statusFilter={filters.statusFilter}
              onStatusChange={filters.setStatusFilter}
            />
          </div>
        </CardContent>
      </Card>

      <UsersList
        users={filters.paged}
        totalCount={users.length}
        page={filters.currentPage}
        totalPages={filters.totalPages}
        rangeStart={filters.rangeStart}
        rangeEnd={filters.rangeEnd}
        hasFilters={filters.hasFilters}
        searchQuery={filters.search.trim() || undefined}
        isSelf={isSelf}
        has2FA={has2FA}
        canSuspend={canSuspend}
        canDelete={canDelete}
        handlers={handlers}
        onClearFilters={filters.clearFilters}
        onPrev={() => filters.setPage((p) => Math.max(1, p - 1))}
        onNext={() =>
          filters.setPage((p) => Math.min(filters.totalPages, p + 1))
        }
      />

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />

      <DeleteUserDialog
        user={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />

      <UserFormSheet
        open={editId !== null}
        onOpenChange={(open) => {
          if (!open) setEditId(null)
        }}
        form={form}
        onFormChange={setForm}
        onSubmit={submitEdit}
      />
    </div>
  )
}
